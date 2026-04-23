import React, { useState, useRef } from "react";
import { useNotification } from "@refinedev/core";
import { Button } from "./ui/button";
import {} from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Upload, File as FileIcon, X, CheckCircle2 } from "lucide-react";
import { BACKEND_URL, MAX_SYNC_UPLOAD_SIZE_MB, STORAGE_KEYS } from "@/config";
import { useTranslation } from "react-i18next";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { createCorrelationId } from "@/lib/traceability";
import { mbToBytes, bytesToMb, isFileTypeAllowed } from "@/lib/utils";
import { getAuthToken } from "@/lib/auth-helper";

interface FileUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onClear?: () => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // In bytes
}

const DEFAULT_MAX_FILE_SIZE = mbToBytes(10); // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onClear,
  folder = "general",
  label,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp",
  maxSize = DEFAULT_MAX_FILE_SIZE,
}) => {
  const { t } = useTranslation();
  const { open } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef<string | null>(null);

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
          type: "warning" as any,
          message: t("common.upload.largeFileWarning"),
          description: t("common.upload.largeFileWarningDesc"),
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
      const token = getAuthToken();

      // 🚀 RURAL RESILIENCE: Use XMLHttpRequest for progress tracking (Mandate Review #9)
      const xhr = new XMLHttpRequest();
      const promise = new Promise<{ data: { url: string; publicId: string } }>(
        (resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              if (uploadIdRef.current === currentUploadId) {
                setUploadProgress(progress);
              }
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error("Failed to parse response"));
              }
            } else {
              // 🛡️ ERROR HANDLING: Wrap XHR error to match handleError utility (Review #11)
              // We create a duck-typed Response object that matches what handleError expects
              const errorResponse = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: {
                  get: (name: string) => xhr.getResponseHeader(name),
                  "x-correlation-id": xhr.getResponseHeader("x-correlation-id"),
                },
                text: async () => xhr.responseText,
                json: async () => {
                  try {
                    return JSON.parse(xhr.responseText);
                  } catch {
                    return {};
                  }
                },
                // Add axios-like properties just in case
                data: null,
              };
              reject({ response: errorResponse });
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network Error")));
          xhr.addEventListener("abort", () => reject({ name: "AbortError" }));

          xhr.open("POST", `${BACKEND_URL}/assets/upload`);
          xhr.setRequestHeader("X-Correlation-ID", correlationId);
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
          xhr.send(formData);

          controller.signal.addEventListener("abort", () => xhr.abort());
        }
      );

      const result = await promise;

      // 🛡️ RACE GUARD: Only execute callback if this is still the active upload (Mandate Review #9)
      if (uploadIdRef.current === currentUploadId) {
        onUploadSuccess(result.data.url, result.data.publicId);
        setUploadComplete(true);
        setUploadProgress(100);
        open?.({
          type: "success" as any,
          message: t("common.upload.success"),
        });
      }
    } catch (err: unknown) {
      const error = err as any;
      if (error.name === "AbortError" || error.message === "AbortError") return;

      // 🛡️ RACE GUARD: If a newer upload was started, ignore this error (Mandate Review #9)
      if (uploadIdRef.current !== currentUploadId) return;

      console.error("Upload Error:", error);

      // 🛡️ TRACEABILITY: Use handleError to normalize errors from XHR/Fetch
      const normalizedError = await handleError(error);
      const errorCorrelationId = normalizedError.meta?.correlationId || correlationId;

      open?.({
        type: "error",
        message: normalizedError.message || t("common.upload.error"),
        meta: { correlationId: errorCorrelationId },
      } as any);
    } finally {
      // 🛡️ RACE GUARD: Only reset loading state if this is still the active upload (Mandate Review #11)
      if (uploadIdRef.current === currentUploadId) {
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
    }
    uploadIdRef.current = null;
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
