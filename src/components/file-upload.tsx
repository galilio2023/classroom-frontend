import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTablawyNotification } from "@/hooks/use-tablawy-notification";
import { Button } from "./ui/button";
import {} from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Upload, File as FileIcon, X, CheckCircle2, Wifi, Zap } from "lucide-react";
import { BACKEND_URL, MAX_SYNC_UPLOAD_SIZE_MB } from "@/config";
import { useTranslation } from "react-i18next";
import { handleError } from "@/providers/utils/api-errors";
import { createCorrelationId } from "@/lib/traceability";
import { mbToBytes, bytesToMb, isFileTypeAllowed } from "@/lib/utils";
import { calculateETA, requestWithProgress } from "@/lib/api-utils";
import { getAuthToken } from "@/lib/auth-helper";

import { useTusUpload } from "@/hooks/use-tus-upload";
import { UPLOAD_CONSTANTS } from "@/constants/upload";

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
  const {
    startUpload: startTusUpload,
    abortUpload: abortTusUpload,
    progress: tusProgress,
    status: tusStatus,
    uploadUrl: tusUrl,
    tusPublicId,
  } = useTusUpload();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef<string | null>(null);
  const uploadStartTimeRef = useRef<number | null>(null);

  // 🛡️ Mandate Review #13: Optimize resumability check
  const isResumable = useMemo(() => {
    return file && file.size > MAX_SYNC_UPLOAD_SIZE_MB * 1024 * 1024;
  }, [file]);

  // 🛡️ TUS PROGRESS SYNC & DURATION CALCULATION
  useEffect(() => {
    if (tusStatus === "uploading") {
      setUploadProgress(tusProgress);

      if (uploadStartTimeRef.current) {
        const eta = calculateETA(uploadStartTimeRef.current, tusProgress);
        setTimeRemaining(eta);
      }
    }
  }, [tusProgress, tusStatus]);

  // 🛡️ TUS SUCCESS SYNC
  useEffect(() => {
    if (tusStatus === "success" && tusUrl && isUploading && !uploadComplete) {
      // 🛡️ Mandate Review #13: Real identity from TUS response (Hook handles extraction)
      const publicId = tusPublicId || "tus-upload";
      onUploadSuccess(tusUrl, publicId);
      setUploadComplete(true);
      setUploadProgress(100);
      setIsUploading(false);
      open({
        type: "success",
        message: t("common.upload.success", "Resumable upload successful"),
      });
    }
  }, [tusStatus, tusUrl, tusPublicId, isUploading, uploadComplete, onUploadSuccess, t, open]);

  // 🛡️ TUS ERROR SYNC (Mandate Review #13)
  useEffect(() => {
    if (tusStatus === "error" && isUploading) {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeRemaining(null);
      handleError(new Error(t("common.upload.failed", "Resumable upload failed")));
    }
  }, [tusStatus, isUploading, t]);

  // 🛡️ CLEANUP: Ensure any pending upload is aborted on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortTusUpload();
    };
  }, [abortTusUpload]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // 🛡️ SECURITY: Deep check file type validation (Mandate Review #13)
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
      if (selectedFile.size > mbToBytes(MAX_SYNC_UPLOAD_SIZE_MB)) {
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
    const currentUploadId = crypto.randomUUID();
    const controller = new AbortController();

    uploadIdRef.current = currentUploadId;
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
      if (file.size > mbToBytes(UPLOAD_CONSTANTS.TUS_RESUMABLE_THRESHOLD_MB)) {
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
          if (uploadIdRef.current === currentUploadId) {
            setUploadProgress(percent);
          }
        },
      });

      if (uploadIdRef.current === currentUploadId) {
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
      if (uploadIdRef.current !== currentUploadId) return;

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
      if (uploadIdRef.current === currentUploadId || uploadIdRef.current === null) {
        if (file.size <= mbToBytes(UPLOAD_CONSTANTS.TUS_RESUMABLE_THRESHOLD_MB)) {
          setIsUploading(false);
        }
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const clearFile = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    abortTusUpload();

    if (isUploading) {
      open({
        type: "info",
        message: t("common.upload.cancelled", "Upload cancelled"),
      });
    }

    uploadIdRef.current = null;
    setFile(null);
    setUploadComplete(false);
    setUploadProgress(0);
    setTimeRemaining(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear?.();
  }, [isUploading, abortTusUpload, open, t, onClear]);

  const handleContainerClick = () => {
    if (!isUploading && !file) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3 w-full">
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {!file ? (
        <div
          onClick={handleContainerClick}
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer relative min-h-[120px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
          />
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            {t("common.upload.clickOrDrag")}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {t("common.upload.maxSize", {
              size: bytesToMb(maxSize).toFixed(0),
            })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-background shadow-sm overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 rounded-md shrink-0 relative">
                <FileIcon className="h-5 w-5 text-primary" />
                {isResumable && (
                  <Zap className="h-3 w-3 text-amber-500 absolute -top-1 -right-1 fill-amber-500" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate max-w-50 sm:max-w-xs block">
                  {file.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {bytesToMb(file.size).toFixed(2)} MB
                  </span>
                  {isResumable && (
                    <span className="flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      <Wifi className="h-2 w-2" /> Resumable
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              disabled={isUploading}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title={t("common.upload.remove")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t mt-1">
            {isUploading && (
              <div className="w-full space-y-1" aria-live="polite">
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                  <div className="flex items-center gap-2">
                    <span>{t("common.upload.progress", "Uploading...")}</span>
                    {timeRemaining && (
                      <span className="normal-case opacity-70">({timeRemaining})</span>
                    )}
                  </div>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuetext={
                      timeRemaining
                        ? `${Math.round(uploadProgress)}%, ${timeRemaining}`
                        : `${Math.round(uploadProgress)}%`
                    }
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end">
              {!uploadComplete ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={isUploading}
                  className="w-full sm:w-auto min-w-[100px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {tusStatus === "uploading"
                        ? t("buttons.resuming", "Resuming...")
                        : t("buttons.uploading")}
                    </>
                  ) : (
                    <>
                      <Upload className="me-2 h-4 w-4" />
                      {t("common.upload.label")}
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium w-full justify-end bg-green-50/50 dark:bg-green-900/10 p-2 rounded">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("common.upload.uploaded")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
