import React, { useState, useRef } from "react";
import { useTablawyNotification } from "@/hooks/use-tablawy-notification";
import { Button } from "./ui/button";
import {} from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Upload, File as FileIcon, X, CheckCircle2 } from "lucide-react";
import { BACKEND_URL, MAX_SYNC_UPLOAD_SIZE_MB, STORAGE_KEYS } from "@/config";
import { useTranslation } from "react-i18next";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { createCorrelationId } from "@/lib/traceability";
import { mbToBytes, bytesToMb, isFileTypeAllowed } from "@/lib/utils";
import { requestWithProgress } from "@/lib/api-utils";
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
  const { startUpload: startTusUpload, progress: tusProgress, isUploading: isTusUploading } = useTusUpload();
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef<string | null>(null);

  // Sync TUS progress to local state
  React.useEffect(() => {
    if (isTusUploading) {
      setUploadProgress(tusProgress);
    }
  }, [tusProgress, isTusUploading]);

  // ... rest of component logic ...

  // 🛡️ CLEANUP: Ensure any pending upload is aborted on unmount (Mandate Review #8)
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // 🛡️ SECURITY: Strict file type validation (Mandate Review #9)
      if (!isFileTypeAllowed(selectedFile, accept)) {
        open?.({
          type: "error",
          message: t("common.upload.invalidType", "Invalid file type"),
          description: t("common.upload.invalidTypeDesc", {
            accept,
            defaultValue: `Accepted formats: ${accept}`,
          }),
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (selectedFile.size > maxSize) {
        open?.({
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
        open?.({
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
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const currentUploadId = crypto.randomUUID();
    uploadIdRef.current = currentUploadId;

    // 🛡️ CLEANUP: Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    // 🛡️ TRACEABILITY: Use standardized utility for correlation IDs (Mandate Review #8)
    const correlationId = createCorrelationId("upload");

    try {
      // 🚀 RURAL RESILIENCE: Use TUS for resumable uploads if file is > 5MB (Mandate Review #12)
      if (file.size > mbToBytes(UPLOAD_CONSTANTS.TUS_RESUMABLE_THRESHOLD_MB)) {
        const tusResult = await startTusUpload(file, { folder, correlationId });
        // TUS client returns once upload is finished
        if (uploadIdRef.current === currentUploadId) {
          // Note: TUS server response would need to return publicId in metadata or via separate fetch
          // For now, mapping TUS success to standard callback
          onUploadSuccess(tusResult.url!, "tus-public-id");
          setUploadComplete(true);
          setUploadProgress(100);
          open?.({
            type: "success",
            message: t("common.upload.success", "Resumable upload successful"),
          });
        }
        return;
      }

      const token = getAuthToken();

      // 🚀 RURAL RESILIENCE: Use requestWithProgress for percentage-based feedback (Mandate Review #11)
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

      // 🛡️ RACE GUARD: Only execute callback if this is still the active upload (Mandate Review #9)
      if (uploadIdRef.current === currentUploadId) {
        onUploadSuccess(result.data.url, result.data.publicId);
        setUploadComplete(true);
        setUploadProgress(100);
        open?.({
          type: "success",
          message: t("common.upload.success", "Upload successful"),
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "AbortError" || err.message === "AbortError")) return;

      // 🛡️ RACE GUARD: If a newer upload was started, ignore this error (Mandate Review #9)
      if (uploadIdRef.current !== currentUploadId) return;

      console.error("Upload Error:", err);

      // 🛡️ TRACEABILITY: Use handleError to normalize errors from XHR/Fetch
      const normalizedError = await handleError(err);
      const errorCorrelationId = (normalizedError as any).meta?.correlationId || correlationId;

      open?.({
        type: "error",
        message: normalizedError.message || t("common.upload.error", "Failed to upload file"),
        meta: { correlationId: errorCorrelationId },
      });
    } finally {
      // 🛡️ RACE GUARD (Review #13): Ensure loading state is reset correctly.
      // If this was the most recent upload, stop the spinner.
      if (uploadIdRef.current === currentUploadId || uploadIdRef.current === null) {
        setIsUploading(false);
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const clearFile = () => {
    // 🛡️ CLEANUP: Abort any active upload request and reset ID (Mandate Review #9)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      
      // 🛡️ UX: Inform the user that the upload was cancelled (Mandate Review #12)
      if (isUploading) {
        open?.({
          type: "info",
          message: t("common.upload.cancelled", "Upload cancelled"),
        });
      }
    }
    uploadIdRef.current = null;
    setFile(null);
    setUploadComplete(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear?.();
  };

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
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-background shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 rounded-md shrink-0">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate max-w-50 sm:max-w-xs block">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {bytesToMb(file.size).toFixed(2)} MB
                </span>
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
                  <span>{t("common.upload.progress", "Uploading...")}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
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
                      {t("buttons.uploading")}
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
