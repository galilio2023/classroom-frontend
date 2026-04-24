import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTablawyNotification } from "@/hooks/use-tablawy-notification";
import { useTranslation } from "react-i18next";
import { useGetIdentity } from "@refinedev/core";
import { getAuthToken } from "@/lib/auth-helper";
import { User } from "@/types";
import { handleError } from "@/providers/utils/api-errors";
import { createCorrelationId } from "@/lib/traceability";
import { bytesToMb, isFileTypeAllowed } from "@/lib/utils";
import { calculateETA as calculateETAHelper, requestWithProgress } from "@/lib/api-utils";
import { BACKEND_URL, MAX_SYNC_UPLOAD_SIZE_MB, TUS_ENDPOINT } from "@/config";
import { useTusUpload } from "@/hooks/use-tus-upload";
import { UPLOAD_CONSTANTS } from "@/constants/upload";

interface UseFileUploadLogicProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onError?: (error: any) => void;
  onClear?: () => void;
  folder?: string;
  accept?: string;
  maxSize?: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const useFileUploadLogic = ({
  onUploadSuccess,
  onError,
  onClear,
  folder = "general",
  accept,
  maxSize,
  inputRef,
}: UseFileUploadLogicProps) => {
  const { t } = useTranslation();
  const { open } = useTablawyNotification();
  const { data: identity } = useGetIdentity<User>();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  const {
    startUpload: startTusUpload,
    abortUpload: abortTusUpload,
    progress: tusProgress,
    status: tusStatus,
    error: tusError,
    uploadUrl: tusUrl,
    tusPublicId,
    currentUploadId,
    isResuming,
    isRetrying,
  } = useTusUpload();

  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef<string | null>(null);
  const correlationIdRef = useRef<string | null>(null);
  const uploadStartTimeRef = useRef<number | null>(null);

  const calculateETA = useCallback((startTime: number, progress: number) => {
    return calculateETAHelper(startTime, progress);
  }, []);

  const isResumable = useMemo(() => {
    return file && bytesToMb(file.size) > MAX_SYNC_UPLOAD_SIZE_MB && !!TUS_ENDPOINT;
  }, [file]);

  const handleUpload = useCallback(async () => {
    if (!file || isUploading) return;
    const activeUploadId = crypto.randomUUID();
    const controller = new AbortController();
    const correlationId = createCorrelationId("upload");
    uploadIdRef.current = activeUploadId;
    correlationIdRef.current = correlationId;
    abortControllerRef.current = controller;
    uploadStartTimeRef.current = Date.now();
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const token = getAuthToken();
      if (isResumable) {
        if (!TUS_ENDPOINT) {
          console.warn("⚠️ TUS_ENDPOINT not configured, falling back to standard upload.");
        } else {
          try {
            const healthCheck = await fetch(TUS_ENDPOINT, {
              method: "OPTIONS",
              signal: controller.signal,
              headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            if (!healthCheck.ok && healthCheck.status !== 405 && healthCheck.status !== 204) {
              throw new Error("TUS endpoint unreachable");
            }
            const fingerprint = `${file.name}-${file.size}-${file.type}`;
            const persistedUrl = localStorage.getItem(`tus-upload-${fingerprint}`);
            startTusUpload(file, token, {
              folder,
              correlationId,
              userId: identity?.id || "anonymous",
              ...(persistedUrl ? { uploadUrl: persistedUrl } : {}),
            });
            return;
          } catch (tusErr) {
            console.warn("⚠️ TUS pre-flight failed, degrading to standard upload:", tusErr);
          }
        }
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const result = await requestWithProgress<{ data: { url: string; publicId: string } }>({
        url: `${BACKEND_URL}/assets/upload`,
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          "X-Correlation-ID": correlationId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onProgress: (percent) => {
          if (uploadIdRef.current === activeUploadId) {
            setUploadProgress(percent);
          }
        },
      });
      if (uploadIdRef.current === activeUploadId) {
        onUploadSuccess(result.data.url, result.data.publicId);
        setUploadComplete(true);
        setUploadProgress(100);
        setIsUploading(false);
        uploadIdRef.current = null;
        correlationIdRef.current = null;
        open({ type: "success", message: t("common.upload.success", "Upload successful") });
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "AbortError" || err.message === "AbortError"))
        return;
      if (uploadIdRef.current !== activeUploadId) return;
      const normalizedError = await handleError(err);

      // 🛡️ Mandate Review #15: Optional callback for parent component
      onError?.(normalizedError);

      open({
        type: "error",
        message: normalizedError.message || t("common.upload.error", "Failed to upload file"),
        meta: { correlationId: (normalizedError as any).meta?.correlationId || correlationId },
      });
      correlationIdRef.current = null;
    } finally {
      if (uploadIdRef.current === activeUploadId || uploadIdRef.current === null) {
        if (!isResumable) setIsUploading(false);
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [file, isUploading, isResumable, startTusUpload, folder, onUploadSuccess, open, t]);

  useEffect(() => {
    if (tusStatus === "uploading") {
      setUploadProgress(tusProgress);
      if (uploadStartTimeRef.current) {
        const eta = calculateETA(uploadStartTimeRef.current, tusProgress);
        setTimeRemaining(eta);
      }
      if (tusUrl && file) {
        const fingerprint = `${file.name}-${file.size}-${file.type}`;
        localStorage.setItem(`tus-upload-${fingerprint}`, tusUrl);
      }
    }
  }, [tusProgress, tusStatus, calculateETA, tusUrl, file]);

  useEffect(() => {
    if (!file) return;
    if (
      tusStatus === "success" &&
      tusUrl &&
      isUploading &&
      !uploadComplete &&
      currentUploadId &&
      currentUploadId === uploadIdRef.current
    ) {
      const fingerprint = `${file.name}-${file.size}-${file.type}`;
      localStorage.removeItem(`tus-upload-${fingerprint}`);
      onUploadSuccess(tusUrl, tusPublicId!);
      setUploadComplete(true);
      setUploadProgress(100);
      setIsUploading(false);
      uploadIdRef.current = null;
      correlationIdRef.current = null;
      open({
        type: "success",
        message: t("common.upload.success", "Resumable upload successful"),
      });
    }
  }, [
    tusStatus,
    tusUrl,
    tusPublicId,
    isUploading,
    uploadComplete,
    onUploadSuccess,
    t,
    open,
    currentUploadId,
    file,
  ]);

  useEffect(() => {
    if (!file) return;
    if (
      tusStatus === "error" &&
      isUploading &&
      currentUploadId &&
      currentUploadId === uploadIdRef.current
    ) {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeRemaining(null);
      uploadIdRef.current = null;
      void (async () => {
        const normalizedError = await handleError(
          tusError || new Error(t("common.upload.failed", "Resumable upload failed"))
        );
        open({
          type: "error",
          message: normalizedError.message,
          meta: {
            correlationId: (normalizedError as any).meta?.correlationId || correlationIdRef.current,
          },
        });
        correlationIdRef.current = null;
      })();
    }
  }, [tusStatus, isUploading, t, tusError, currentUploadId, file, open]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isUploading && isResumable) {
        console.log("📑 Tab hidden during large upload. TUS persistence maintaining connection...");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isUploading, isResumable]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortTusUpload();
    };
  }, [abortTusUpload]);

  const handleRetry = useCallback(() => {
    if (file && !isUploading && !uploadComplete) {
      void handleUpload();
    }
  }, [file, isUploading, uploadComplete, handleUpload]);

  useEffect(() => {
    window.addEventListener("tablawy:retry_job_sync", handleRetry);
    return () => window.removeEventListener("tablawy:retry_job_sync", handleRetry);
  }, [handleRetry]);

  const abortUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortTusUpload();
    setIsUploading(false);
  }, [abortTusUpload]);

  const clearFile = useCallback(() => {
    if (file) {
      const fingerprint = `${file.name}-${file.size}-${file.type}`;
      localStorage.removeItem(`tus-upload-${fingerprint}`);
    }

    setFile(null);
    setUploadComplete(false);
    setUploadProgress(0);
    setTimeRemaining(null);
    setIsUploading(false);

    abortUpload();

    // 🛡️ SYNC ABORT (Priority 1): Reset ID ONLY after abort signal is sent
    uploadIdRef.current = null;
    correlationIdRef.current = null;
    uploadStartTimeRef.current = null;

    if (inputRef?.current) {
      inputRef.current.value = "";
    }

    onClear?.();
  }, [onClear, abortUpload, inputRef, file]);

  const handleFileChange = useCallback(
    async (selectedFile: File) => {
      try {
        const isAllowed = await isFileTypeAllowed(selectedFile, accept || "");
        if (!isAllowed) {
          // 🛡️ UX: Reset internal state if validation fails (Review #15)
          setFile(null);
          setUploadComplete(false);
          setUploadProgress(0);

          open({
            type: "error",
            message: t("common.upload.invalidType", "Invalid file type"),
            description: t("common.upload.invalidTypeDesc", "This file format is not permitted."),
          });
          return;
        }
        if (maxSize && selectedFile.size > maxSize) {
          // 🛡️ UX: Reset internal state if validation fails (Review #15)
          setFile(null);
          setUploadComplete(false);
          setUploadProgress(0);

          open({
            type: "error",
            message: t("common.upload.tooLarge"),
            description: t("common.upload.tooLargeDesc", {
              size: bytesToMb(maxSize).toFixed(0),
            }),
          });
          return;
        }
        if (bytesToMb(selectedFile.size) > MAX_SYNC_UPLOAD_SIZE_MB) {
          open({
            type: "warning",
            message: t("common.upload.largeFileWarning", "Large file detected"),
            description: t(
              "common.upload.largeFileWarningDesc",
              "This file is large and may take time to upload on slow connections."
            ),
          });
        }
        setFile(selectedFile);
        setUploadComplete(false);
        setUploadProgress(0);
        setTimeRemaining(null);
      } catch (err) {
        void handleError(err).then((normalizedError) => {
          open({
            type: "error",
            message: normalizedError.message,
          });
        });
      }
    },
    [accept, maxSize, open, t]
  );

  return {
    file,
    isUploading,
    uploadComplete,
    uploadProgress,
    isDragging,
    timeRemaining,
    isResumable,
    isResuming,
    isRetrying,
    tusStatus,
    setIsDragging,
    clearFile,
    handleUpload,
    handleFileChange,
    abortUpload,
    setFile,
    setUploadComplete,
    setUploadProgress,
    setTimeRemaining,
  };
};
