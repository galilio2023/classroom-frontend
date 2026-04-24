import { useState, useCallback, useRef } from "react";
import * as tus from "tus-js-client";
import { TUS_ENDPOINT } from "@/config";
import { calculateBackoff } from "@/lib/jitter";

/**
 * 🛰️ CUSTOM HOOK: useTusUpload
 * Mandate Review #12: Resumable upload client for files > 5MB.
 * Ensures reliability in rural areas with poor connectivity.
 */
export type TusStatus = "idle" | "uploading" | "success" | "error";

export const useTusUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<TusStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [tusPublicId, setTusPublicId] = useState<string | null>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const uploadRef = useRef<tus.Upload | null>(null);

  const abortUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
      setStatus("idle");
      setCurrentUploadId(null);
    }
  }, []);

  const startUpload = useCallback(
    (file: File, token: string | null, metadata: Record<string, string> = {}) => {
      const uploadId = crypto.randomUUID();

      setCurrentUploadId(uploadId);
      setStatus("uploading");
      setError(null);
      setProgress(0);
      setIsResuming(false);
      setIsRetrying(false);

      const upload = new tus.Upload(file, {
        endpoint: TUS_ENDPOINT,
        retryDelays: [0, 1, 2, 3, 4, 5].map((attempt) => calculateBackoff(attempt, 5000, 31000)),
        removeFingerprintOnSuccess: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
          uploadId,
          ...metadata,
        },
        onAfterResponse: (_req, res) => {
          const publicId = res.getHeader("X-Public-ID");
          if (publicId) {
            setTusPublicId(publicId);
          }
        },
        onShouldRetry: () => {
          console.log(" TUS: Connection lost, attempting to retry...");
          setIsRetrying(true);
          return true;
        },
        onError: (err) => {
          setError(err);
          setStatus("error");
          setCurrentUploadId(null);
          setIsResuming(false);
          setIsRetrying(false);
          window.removeEventListener("online", resumeHandler);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          setProgress(percentage);
          if (isResuming) setIsResuming(false);
          if (isRetrying) setIsRetrying(false);
        },
        onSuccess: () => {
          setUploadUrl(upload.url);
          const resourceId = upload.url?.split("/").pop();
          setTusPublicId(resourceId || crypto.randomUUID());
          setStatus("success");
          setIsResuming(false);
          setIsRetrying(false);
          window.removeEventListener("online", resumeHandler);
        },
      });

      uploadRef.current = upload;

      function resumeHandler() {
        if (uploadRef.current) {
          console.log("🌐 Network returned. Resuming TUS upload...");
          setIsResuming(true);
          setIsRetrying(false);
          uploadRef.current.start();
        }
      }
      window.addEventListener("online", resumeHandler);

      upload.start();
      return upload;
    },
    [status, isResuming, isRetrying]
  );

  return {
    startUpload,
    abortUpload,
    progress,
    status,
    error,
    uploadUrl,
    tusPublicId,
    currentUploadId,
    isResuming,
    isRetrying,
  };
};
