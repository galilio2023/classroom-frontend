import React from "react";
import { Upload, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface DropzoneAreaProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  accept?: string;
  maxSizeMb?: number;
}

export const DropzoneArea: React.FC<DropzoneAreaProps> = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  accept,
  maxSizeMb = 10,
}) => {
  const { t } = useTranslation();
  const { isOnline } = useOfflineSync();

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={isOnline ? onClick : undefined}
      className={cn(
        "group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 relative min-h-[160px]",
        !isOnline
          ? "border-destructive/30 bg-destructive/5 cursor-not-allowed opacity-80"
          : isDragging
            ? "border-primary bg-primary/5 scale-[0.98] ring-4 ring-primary/10 cursor-pointer"
            : "border-border/60 hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
      )}
    >
      <div
        className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform duration-500 shadow-sm border",
          !isOnline
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : "bg-primary/5 text-primary group-hover:scale-110 border-primary/10"
        )}
      >
        {!isOnline ? <WifiOff className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
      </div>

      <div className="text-center space-y-1.5">
        <p
          className={cn(
            "text-sm font-black uppercase tracking-widest transition-colors",
            !isOnline ? "text-destructive" : "text-foreground/80 group-hover:text-primary"
          )}
        >
          {!isOnline
            ? t("common.notifications.offline", "Internet Connection Required")
            : t("common.upload.clickOrDrag", "Click or drag to select a file")}
        </p>
        <p className="overline">
          {t("common.upload.maxSize", "Max size: {{size}}MB", {
            size: maxSizeMb,
          })}
        </p>
        {accept && (
          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tight">
            {accept.split(",").join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
};
