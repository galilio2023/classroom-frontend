import React from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={cn(
        "group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer relative min-h-[160px]",
        isDragging
          ? "border-primary bg-primary/5 scale-[0.98] ring-4 ring-primary/10"
          : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/10">
        <Upload className="h-7 w-7" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-sm font-black uppercase tracking-widest text-foreground/80 group-hover:text-primary transition-colors">
          {t("common.upload.clickOrDrag", "Click or drag to select a file")}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
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
