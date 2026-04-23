import React from "react";
import { Button } from "@/components/ui/button";
import { File as FileIcon, X, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { bytesToMb } from "@/lib/utils";

interface SelectedFileCardProps {
  file: File;
  uploadComplete: boolean;
  isUploading: boolean;
  onClear: () => void;
}

export const SelectedFileCard: React.FC<SelectedFileCardProps> = ({
  file,
  uploadComplete,
  isUploading,
  onClear,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40 group hover:border-primary/20 transition-all shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-border/50 group-hover:scale-110 transition-transform">
        {uploadComplete ? (
          <CheckCircle2 className="h-6 w-6 text-success" />
        ) : (
          <FileIcon className="h-6 w-6" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-black tracking-tight truncate uppercase">
          {file.name}
        </p>
        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-0.5">
          {bytesToMb(file.size).toFixed(2)} MB
        </p>
      </div>

      {!uploadComplete && !isUploading && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
