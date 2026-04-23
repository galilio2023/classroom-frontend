import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTablawyNotification } from "@/hooks/use-tablawy-notification";
import { useTranslation } from "react-i18next";
import { handleError } from "@/providers/utils/api-errors";
import { createCorrelationId } from "@/lib/traceability";
import { bytesToMb, isFileTypeAllowed } from "@/lib/utils";
import { calculateETA as calculateETAHelper, requestWithProgress } from "@/lib/api-utils";
import { getAuthToken } from "@/lib/auth-helper";
import {
  BACKEND_URL,
  MAX_SYNC_UPLOAD_SIZE_MB,
  TUS_ENDPOINT,
  INITIAL_RETRY_DELAY,
  MAX_RETRY_DELAY,
} from "@/config";
import { useTusUpload } from "@/hooks/use-tus-upload";

interface UseFileUploadLogicProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onClear?: () => void;
  folder?: string;
  accept?: string;
  maxSize?: number;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const useFileUploadLogic = ({
  onUploadSuccess,
  onClear,
  folder = "general",
  accept,
  maxSize,
  inputRef,
}: UseFileUploadLogicProps) => {
  const { t } = useTranslation();
  const { open } = useTablawyNotification();

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
  } = useTusUpload();

  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef<string | null>(null);
  const uploadStartTimeRef = useRef<number | null>(null);

  // 🚀 REACT 19 PERFORMANCE (Priority 2): Memoized ETA helper
  const calculateETA = useCallback((startTime: number, progress: number) => {
    return calculateETAHelper(startTime, progress);
  }, []);

  const isResumable = useMemo(() => {
    return file && bytesToMb(file.size) > MAX_SYNC_UPLOAD_SIZE_MB && !!TUS_ENDPOINT;
  }, [file]);

  // 🛡️ TUS PROGRESS SYNC
  useEffect(() => {
    if (tusStatus === "uploading") {
      setUploadProgress(tusProgress);

      if (uploadStartTimeRef.current) {
        const eta = calculateETA(uploadStartTimeRef.current, tusProgress);
        setTimeRemaining(eta);
      }
    }
  }, [tusProgress, tusStatus, calculateETA]);

  // 🛡️ TUS SUCCESS SYNC
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
      onUploadSuccess(tusUrl, tusPublicId!);
      setUploadComplete(true);
      setUploadProgress(100);
      setIsUploading(false);
      uploadIdRef.current = null;
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

  // 🛡️ TUS ERROR SYNC
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
      handleError(tusError || new Error(t("common.upload.failed", "Resumable upload failed")));
    }
  }, [tusStatus, isUploading, t, tusError, currentUploadId, file]);

  // 🛡️ TAB VISIBILITY SAFETY
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isUploading && isResumable) {
        console.log("📑 Tab hidden during large upload. TUS persistence maintaining connection...");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isUploading, isResumable]);

  const clearFile = useCallback(() => {
    setFile(null);
    setUploadComplete(false);
    setUploadProgress(0);
    setTimeRemaining(null);
    setIsUploading(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    abortTusUpload();

    // 🛡️ SYNC ABORT (Priority 1): Reset ID ONLY after abort signal is sent
    uploadIdRef.current = null;
    uploadStartTimeRef.current = null;

    if (inputRef?.current) {
      inputRef.current.value = "";
    }

    onClear?.();
  }, [onClear, abortTusUpload, inputRef]);

  const handleUpload = async () => {
    if (!file || isUploading) return;

    const activeUploadId = crypto.randomUUID();
    const controller = new AbortController();

    uploadIdRef.current = activeUploadId;
    abortControllerRef.current = controller;
    uploadStartTimeRef.current = Date.now();

    setIsUploading(true);
    setUploadProgress(0);

    const correlationId = createCorrelationId("upload");

    try {
      // 🚀 HARDEN TUS FALLBACK (Priority 1)
      if (isResumable) {
        try {
          const token = getAuthToken();
          // Quick pre-flight check if endpoint is reachable
          const healthCheck = await fetch(TUS_ENDPOINT, {
            method: "OPTIONS",
            signal: controller.signal,
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!healthCheck.ok && healthCheck.status !== 405 && healthCheck.status !== 204) {
            throw new Error("TUS endpoint unreachable");
          }

          startTusUpload(file, { folder, correlationId });
          return;
        } catch (tusErr) {
          console.warn("⚠️ TUS pre-flight failed, degrading to standard upload:", tusErr);
          // Fall through to standard upload
        }
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const token = getAuthToken();
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
        open({
          type: "success",
          message: t("common.upload.success", "Upload successful"),
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "AbortError" || err.message === "AbortError"))
        return;
      if (uploadIdRef.current !== activeUploadId) return;

      const normalizedError = await handleError(err);
      open({
        type: "error",
        message: normalizedError.message || t("common.upload.error", "Failed to upload file"),
        meta: { correlationId: (normalizedError as any).meta?.correlationId || correlationId },
      });
    } finally {
      if (uploadIdRef.current === activeUploadId || uploadIdRef.current === null) {
        if (!isResumable) {
          setIsUploading(false);
        }
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleFileChange = async (selectedFile: File) => {
    const isAllowed = await isFileTypeAllowed(selectedFile, accept || "");
    if (!isAllowed) {
      open({
        type: "error",
        message: t("common.upload.invalidType", "Invalid file type"),
        description: t("common.upload.invalidTypeDesc", "This file format is not permitted."),
      });
      return;
    }

    if (maxSize && selectedFile.size > maxSize) {
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
  };

  return {
    file,
    isUploading,
    uploadComplete,
    uploadProgress,
    isDragging,
    timeRemaining,
    isResumable,
    tusStatus,
    setIsDragging,
    clearFile,
    handleUpload,
    handleFileChange,
    setFile,
    setUploadComplete,
    setUploadProgress,
    setTimeRemaining,
  };
};
