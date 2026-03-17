import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Upload, File as FileIcon, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/config";
import { useTranslation } from "react-i18next";

interface FileUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onClear?: () => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // In bytes
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadSuccess, 
  onClear,
  folder = "general",
  label,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp",
  maxSize = DEFAULT_MAX_FILE_SIZE
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Fix for truncated code in original diff
      if (selectedFile.size > maxSize) {
        toast.error(t("common.upload.tooLarge"), {
          description: t("common.upload.tooLargeDesc", { size: (maxSize / (1024 * 1024)).toFixed(0) })
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setFile(selectedFile);
      setUploadComplete(false);
      setUploadedPublicId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const token = localStorage.getItem("token"); // Get token for authorization
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
        headers: {
             ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || t("common.upload.error"));
        setIsUploading(false);
        return;
      }

      const result = await response.json();
      onUploadSuccess(result.data.url, result.data.publicId);
      setUploadedPublicId(result.data.publicId);
      setUploadComplete(true);
      toast.success(t("common.upload.success"));
    } catch (error: any) {
      console.error("Upload Error:", error);
      const message = error instanceof Error ? error.message : t("common.upload.error");
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadComplete(false);
    setUploadedPublicId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear?.();
  };

  const handleContainerClick = () => {
      // Trigger file input click only if not uploading
      if (!isUploading && !file) {
        fileInputRef.current?.click();
      }
  };

  const isVideo = folder === "trailers" || (accept && accept.includes("video"));

  return (
    <div className="space-y-3 w-full">
      {label && (
        <Label className="text-sm font-medium">
          {label}
        </Label>
      )}
      
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
          <p className="text-sm font-medium text-muted-foreground">{t("common.upload.clickOrDrag")}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {t("common.upload.maxSize", { size: (maxSize / (1024 * 1024)).toFixed(0) })}
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
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
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

          <div className="flex justify-end pt-2 border-t mt-1">
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("buttons.uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
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
      )}
    </div>
  );
};
