import { useState, useCallback } from "react";
import * as tus from "tus-js-client";
import { BACKEND_URL } from "@/config";

/**
 * 🛰️ CUSTOM HOOK: useTusUpload
 * Mandate Review #12: Resumable upload client for files > 5MB.
 * Ensures reliability in rural areas with poor connectivity.
 */
export const useTusUpload = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const startUpload = useCallback((file: File, metadata: Record<string, string> = {}) => {
    setIsUploading(true);
    setError(null);

    const upload = new tus.Upload(file, {
      endpoint: `${BACKEND_URL}/api/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
        ...metadata,
      },
      onError: (err) => {
        setError(err);
        setIsUploading(false);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = (bytesUploaded / bytesTotal) * 100;
        setProgress(percentage);
      },
      onSuccess: () => {
        setUploadUrl(upload.url);
        setIsUploading(false);
      },
    });

    upload.start();
    return upload;
  }, []);

  return { startUpload, progress, isUploading, error, uploadUrl };
};
