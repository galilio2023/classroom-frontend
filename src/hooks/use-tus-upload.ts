import { useState, useCallback, useRef } from "react";
import * as tus from "tus-js-client";
import { TUS_ENDPOINT } from "@/config";
import { getAuthToken } from "@/lib/auth-helper";
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
    (file: File, metadata: Record<string, string> = {}) => {
      const uploadId = crypto.randomUUID();
      const token = getAuthToken();

      setCurrentUploadId(uploadId);
      setStatus("uploading");
      setError(null);
      setProgress(0);

      const upload = new tus.Upload(file, {
        endpoint: TUS_ENDPOINT,
        // 🛡️ Mandate Review #12: Full Jitter for Rural Resilience (Thundering Herd prevention)
        // Formula: random(0, min(cap, base * 2^attempt))
        retryDelays: [0, 1, 2, 3, 4].map((attempt) => calculateBackoff(attempt, 1000, 31000)),
        removeFingerprintOnSuccess: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
          uploadId, // 🛡️ TRACEABILITY: Tie the request to a specific frontend session
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
          setCurrentUploadId(null);
          window.removeEventListener("online", resumeHandler);
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
          // 🛡️ SECURITY: Generate a fallback UUID if identity is missing to prevent hardcoded collisions
          setTusPublicId(resourceId || crypto.randomUUID());
          setStatus("success");
          window.removeEventListener("online", resumeHandler);
        },
      });

      uploadRef.current = upload;

      // 📡 NETWORK RESILIENCE: Listen for online events to resume
      function resumeHandler() {
        if (uploadRef.current) {
          console.log("🌐 Network returned. Resuming TUS upload...");
          uploadRef.current.start();
        }
      }
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
    currentUploadId,
  };
};
