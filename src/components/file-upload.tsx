import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Upload, File, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  folder?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadSuccess, 
  folder = "general",
  label = "Upload File"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
        // Note: We don't set Content-Type header, fetch does it automatically for FormData
        // and includes the boundary string.
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      onUploadSuccess(result.data.url, result.data.publicId);
      setUploadComplete(true);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadComplete(false);
  };

  return (
    <div className="space-y-4 w-full">
      <Label htmlFor="file-upload" className="text-sm font-medium">
        {label}
      </Label>
      
      {!file ? (
        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer relative">
          <Input
            id="file-upload"
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Click or drag to select a file</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Max size: 10MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 bg-primary/10 rounded-md">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!uploadComplete ? (
              <>
                <Button 
                  size="sm" 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  className="h-8"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearFile} 
                  disabled={isUploading}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium px-2">
                <CheckCircle2 className="h-4 w-4" />
                Uploaded
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
