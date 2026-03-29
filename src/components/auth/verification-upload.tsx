import React, { useState, useRef } from "react";
import { UploadCloud, FileCheck, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BACKEND_URL } from "@/config";
import { useTranslation } from "react-i18next";

interface VerificationUploadProps {
  url?: string;
  onUpload: (url: string, publicId: string) => void;
  onClear: () => void;
}

export const VerificationUpload = ({ url, onUpload, onClear }: VerificationUploadProps) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("common.upload.tooLarge"));
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "verification");

    try {
      const token = localStorage.getItem("tablawy_auth_token");
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        toast.error(t("auth.register.verification.error"));
        setIsUploading(false);
        return;
      }

      const result = await response.json();

      onUpload(result.data.url, result.data.publicId);
      toast.success(t("auth.register.verification.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("auth.register.verification.error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" />
        {t("auth.register.verification.title")}
      </Label>

      <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 bg-muted/20 hover:bg-muted/30 transition-colors">
        {url ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg w-full justify-center">
              <FileCheck className="h-5 w-5" />
              <span>{t("auth.register.verification.documentUploaded")}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs w-full gap-2 text-destructive hover:text-destructive"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
              {t("buttons.change")}
            </Button>
          </div>
        ) : (
          <>
            <div className="p-3 bg-primary/10 rounded-full">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">{t("auth.register.verification.uploadLabel")}</p>
              <p className="text-xs text-muted-foreground">
                {t("auth.register.verification.formatLabel")}
              </p>
            </div>

            <Input
              type="file"
              className="hidden"
              ref={fileInputRef}
              id="doc-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={isUploading}
            />

            <Button
              type="button"
              variant="default"
              size="sm"
              className="mt-2 w-full max-w-50"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                  {t("buttons.uploading")}
                </>
              ) : (
                t("buttons.selectFile")
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
