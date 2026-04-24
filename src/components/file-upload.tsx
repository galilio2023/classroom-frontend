import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Upload, AlertCircle, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { bytesToMb } from "@/lib/utils";
import { MAX_SYNC_UPLOAD_SIZE_MB } from "@/config";

// 🏗️ DECONSTRUCTION: Extracted sub-components (Mandate Review #13)
import { DropzoneArea } from "./upload/dropzone-area";
import { SelectedFileCard } from "./upload/selected-file-card";
import { UploadProgressBar } from "./upload/upload-progress-bar";
import { useFileUploadLogic } from "@/hooks/use-file-upload-logic";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface FileUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onClear?: () => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // In bytes
}

/**
 * 🚀 FILE UPLOAD COMPONENT
 * Handled via useFileUploadLogic for React 19 performance and modularity.
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onUploadSuccess,
  onClear,
  folder,
  maxSize = MAX_SYNC_UPLOAD_SIZE_MB * 1024 * 1024, // Set default from config
}) => {
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { isOnline } = useOfflineSync();

  const {
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
  } = useFileUploadLogic({
    onUploadSuccess,
    onClear,
    folder,
    accept,
    maxSize,
    inputRef: fileInputRef,
  });

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
      void handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const renderButtonContent = () => {
    if (!isOnline && !isUploading) {
      return (
        <>
          <WifiOff className="me-2 h-4 w-4" />
          {t("common.notifications.offline", "Offline")}
        </>
      );
    }

    if (!isUploading) {
      return (
        <>
          <Upload className="me-2 h-4 w-4" />
          {t("common.upload.label", "Start Upload")}
        </>
      );
    }

    if (isResuming) {
      return (
        <>
          <WifiOff className="me-2 h-4 w-4 animate-pulse text-amber-400" />
          {t("buttons.resuming", "Resuming...")}
        </>
      );
    }

    if (isRetrying) {
      return (
        <>
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
          {t("buttons.reconnecting", "Reconnecting...")}
        </>
      );
    }

    return (
      <>
        <Loader2 className="me-2 h-4 w-4 animate-spin" />
        {isResumable
          ? t("buttons.uploadingResumable", "Uploading...")
          : t("buttons.uploading", "Uploading...")}
      </>
    );
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
                type="button"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleUpload();
                }}
                disabled={isUploading || !isOnline}
                className="w-full sm:w-auto min-w-[140px] rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 shadow-lg shadow-primary/25"
              >
                {renderButtonContent()}
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

          {isResumable && !isUploading && !uploadComplete && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 overline text-amber-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {t(
                "common.upload.largeFileWarningDesc",
                "Large file detected. Resumable mode active for reliability."
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            void handleFileChange(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
