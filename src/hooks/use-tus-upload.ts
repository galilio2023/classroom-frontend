import { useState, useCallback, useRef } from "react";
import * as tus from "tus-js-client";
import { BACKEND_URL } from "@/config";

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

  const uploadRef = useRef<tus.Upload | null>(null);

  const abortUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
      setStatus("idle");
    }
  }, []);

  const startUpload = useCallback(
    (file: File, metadata: Record<string, string> = {}) => {
      setStatus("uploading");
      setError(null);
      setProgress(0);

      const upload = new tus.Upload(file, {
        endpoint: `${BACKEND_URL}/api/upload/resumable`,
        // 🛡️ Mandate Review #12: Full Jitter for Rural Resilience (Thundering Herd prevention)
        // Formula: random(0, min(cap, base * 2^attempt))
        retryDelays: [1000, 3000, 7000, 15000, 31000].map((base) => Math.random() * base),
        removeFingerprintOnSuccess: true,
        metadata: {
          filename: file.name,
          filetype: file.type,
          ...metadata,
        },
        onAfterResponse: (_req, res) => {
          // 🛡️ Mandate Review #13: Extract storage identity from response headers
          const publicId = res.getHeader("X-Public-ID");
          if (publicId) {
            setTusPublicId(publicId);
          }
        },
        onError: (err) => {
          setError(err);
          setStatus("error");
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          setProgress(percentage);
        },
        onSuccess: () => {
          setUploadUrl(upload.url);
          // 🛡️ Mandate Review #13: Extract storage identity from response headers
          // Fallback to the unique TUS resource ID from the URL.
          const resourceId = upload.url?.split("/").pop();
          setTusPublicId(resourceId || null);
          setStatus("success");
        },
      });

      uploadRef.current = upload;

      // 📡 NETWORK RESILIENCE: Listen for online events to resume
      const resumeHandler = () => {
        if (status === "uploading") {
          console.log("🌐 Network returned. Resuming TUS upload...");
          upload.start();
        }
      };
      window.addEventListener("online", resumeHandler);

      upload.start();
      return upload;
    },
    [status]
  );

  return {
    startUpload,
    abortUpload,
    progress,
    status,
    error,
    uploadUrl,
    tusPublicId,
  };
};
