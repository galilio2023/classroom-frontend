import { useState } from "react";
import { UploadCloud, FileCheck, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import axios from "axios";

interface VerificationUploadProps {
  url: string;
  onUpload: (url: string, publicId: string) => void;
  onClear: () => void;
}

export const VerificationUpload = ({ url, onUpload, onClear }: VerificationUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUpload(response.data.url, response.data.publicId);
      toast.success("Document uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Teacher Verification
      </FormLabel>
      <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
        {url ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <FileCheck className="h-5 w-5" />
            Document Uploaded
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={onClear}
            >
              Change
            </Button>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground mb-1" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Upload Teaching License or ID</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, or PNG (max 5MB)</p>
            </div>
            <Input 
              type="file" 
              className="hidden" 
              id="doc-upload" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => document.getElementById("doc-upload")?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Select File
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
