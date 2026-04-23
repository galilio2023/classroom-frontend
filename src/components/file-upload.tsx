import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTablawyNotification } from "@/hooks/use-tablawy-notification";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Loader2, AlertCircle, Upload } from "lucide-react";
import { BACKEND_URL, MAX_SYNC_UPLOAD_SIZE_MB, TUS_ENDPOINT } from "@/config";
import { useTranslation } from "react-i18next";
import { handleError } from "@/providers/utils/api-errors";
import { createCorrelationId } from "@/lib/traceability";
import { mbToBytes, bytesToMb, isFileTypeAllowed } from "@/lib/utils";
import { calculateETA, requestWithProgress } from "@/lib/api-utils";
import { getAuthToken } from "@/lib/auth-helper";

import { useTusUpload } from "@/hooks/use-tus-upload";
import { UPLOAD_CONSTANTS } from "@/constants/upload";

// 🏗️ DECONSTRUCTION: Extracted sub-components (Mandate Review #13)
import { DropzoneArea } from "./upload/dropzone-area";
import { SelectedFileCard } from "./upload/selected-file-card";
import { UploadProgressBar } from "./upload/upload-progress-bar";

interface FileUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onClear?: () => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // In bytes
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onClear,
  folder = "general",
  label,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp",
  maxSize = UPLOAD_CONSTANTS.DEFAULT_MAX_FILE_SIZE,
}) => {
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef<string | null>(null);
  const uploadStartTimeRef = useRef<number | null>(null);

  // 🛡️ Mandate Review #13: Optimize resumability check
  // Fallback to standard upload if TUS_ENDPOINT is explicitly disabled/missing
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
  }, [tusProgress, tusStatus]);

  // 🛡️ TUS SUCCESS SYNC (Hardened with ID verification)
  useEffect(() => {
    // 🛡️ RACE CONDITION GUARD: Only trigger if the TUS success matches our current active upload ID
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
      uploadIdRef.current = null; // 🛡️ RESET: Mark this attempt as finalized
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
  ]);

  // 🛡️ TUS ERROR SYNC (Hardened with ID verification)
  useEffect(() => {
    if (
      tusStatus === "error" &&
      isUploading &&
      currentUploadId &&
      currentUploadId === uploadIdRef.current
    ) {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeRemaining(null);
      uploadIdRef.current = null; // 🛡️ RESET: Allow retry logic to generate new ID
      handleError(tusError || new Error(t("common.upload.failed", "Resumable upload failed")));
    }
  }, [tusStatus, isUploading, t, tusError, currentUploadId]);

  // 🛡️ CLEANUP: Ensure any pending upload is aborted on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortTusUpload();
    };
  }, [abortTusUpload]);

  const clearFile = useCallback(() => {
    setFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setIsUploading(false);
    setTimeRemaining(null);
    uploadIdRef.current = null;
    uploadStartTimeRef.current = null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    abortTusUpload();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear?.();
  }, [onClear, abortTusUpload]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // 🛡️ SECURITY: Deep check file type validation
      const isAllowed = await isFileTypeAllowed(selectedFile, accept);
      if (!isAllowed) {
        open({
          type: "error",
          message: t("common.upload.invalidType", "Invalid file type"),
          description: t("common.upload.invalidTypeDesc", "This file format is not permitted."),
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (selectedFile.size > maxSize) {
        open({
          type: "error",
          message: t("common.upload.tooLarge"),
          description: t("common.upload.tooLargeDesc", {
            size: bytesToMb(maxSize).toFixed(0),
          }),
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // 🛡️ RURAL RESILIENCE: Warn about large files on potentially slow networks
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
    }
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;

    // 🛡️ Mandate Review #13: Synchronous block for Controller + ID
    const activeUploadId = crypto.randomUUID();
    const controller = new AbortController();

    uploadIdRef.current = activeUploadId;
    abortControllerRef.current = controller;
    uploadStartTimeRef.current = Date.now();

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const correlationId = createCorrelationId("upload");

    try {
      // 🚀 RURAL RESILIENCE (Review #13): Use TUS for resumable uploads > 5MB
      if (bytesToMb(file.size) > MAX_SYNC_UPLOAD_SIZE_MB && !!TUS_ENDPOINT) {
        startTusUpload(file, { folder, correlationId });
        return; // Success effect will complete the flow
      }

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

      console.error("Upload Error:", err);

      const normalizedError = await handleError(err);
      const errorCorrelationId = (normalizedError as any).meta?.correlationId || correlationId;

      open({
        type: "error",
        message: normalizedError.message || t("common.upload.error", "Failed to upload file"),
        meta: { correlationId: errorCorrelationId },
      });
    } finally {
      // 🛡️ RACE GUARD (Review #13): Atomic check for ID or Null
      if (uploadIdRef.current === activeUploadId || uploadIdRef.current === null) {
        if (bytesToMb(file.size) <= MAX_SYNC_UPLOAD_SIZE_MB) {
          setIsUploading(false);
        }
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const isAllowed = await isFileTypeAllowed(selectedFile, accept);
      if (!isAllowed) return;

      if (selectedFile.size > maxSize) return;

      setFile(selectedFile);
      setUploadComplete(false);
      setUploadProgress(0);
      setTimeRemaining(null);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {label && <Label className="overline px-1">{label}</Label>}

      {!file ? (
        <DropzoneArea
          isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          accept={accept}
          maxSizeMb={bytesToMb(maxSize)}
        />
      ) : (
        <div className="space-y-4">
          <SelectedFileCard
            file={file}
            uploadComplete={uploadComplete}
            isUploading={isUploading}
            onClear={clearFile}
          />

          {isUploading && (
            <UploadProgressBar
              progress={uploadProgress}
              timeRemaining={timeRemaining}
              isResumable={isResumable || false}
            />
          )}

          <div className="flex justify-end pt-2">
            {!uploadComplete ? (
              <Button
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={isUploading}
                className="w-full sm:w-auto min-w-[140px] rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 shadow-lg shadow-primary/25"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {tusStatus === "uploading"
                      ? t("buttons.resuming", "Resuming...")
                      : t("buttons.uploading", "Uploading...")}
                  </>
                ) : (
                  <>
                    <Upload className="me-2 h-4 w-4" />
                    {t("common.upload.label", "Start Upload")}
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 border-success/20 text-success bg-success/5 hover:bg-success/10 transition-all"
                onClick={clearFile}
              >
                {t("common.upload.change", "Change File")}
              </Button>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  );
};
