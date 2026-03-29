import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import { useApiUrl, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulkEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
}

interface BulkResults {
  created: number;
  enrolled: number;
  errors: { row: number; email: string; error: string }[];
}

export const BulkEnrollDialog = ({ open, onOpenChange, classId }: BulkEnrollDialogProps) => {
  const { t } = useTranslation();
  const apiUrl = useApiUrl();
  const invalidate = useInvalidate();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkResults | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error(t("common.errors.invalidFileType" as any), {
          description: t("common.errors.csvOnly" as any),
        });
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${apiUrl}/classes/${classId}/bulk-enroll`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(response.data.data);
      toast.success(t("classes.show.students.bulk.success" as any));
      invalidate({
        resource: "enrollments",
        invalidates: ["list"],
      });
    } catch (error: any) {
      const message = error.response?.data?.message || t("common.errors.uploadFailed" as any);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) reset();
      }}
    >
      <DialogContent className="sm:max-w-[500px] rounded-4xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-3 text-start">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {t("classes.show.students.bulk.title", "Bulk Enrollment")}
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground/80">
                  {t(
                    "classes.show.students.bulk.description",
                    "Upload a CSV file to enroll multiple students at once."
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {!results ? (
            <div className="space-y-6">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative group cursor-pointer overflow-hidden rounded-4xl border-2 border-dashed transition-all duration-500",
                  file
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />

                <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                  <div
                    className={cn(
                      "p-4 rounded-2xl transition-all duration-500",
                      file
                        ? "bg-primary text-white scale-110 shadow-xl"
                        : "bg-muted text-muted-foreground group-hover:scale-110"
                    )}
                  >
                    {file ? <FileText className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                  </div>

                  <div className="space-y-1">
                    <p className="font-black text-sm uppercase tracking-widest">
                      {file
                        ? file.name
                        : t("classes.show.students.bulk.dropzoneTitle", "Click to upload CSV")}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground">
                      {file
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : t("classes.show.students.bulk.dropzoneLimit", "Max file size: 5MB")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements Info */}
              <Alert className="rounded-2xl border-primary/10 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle className="text-xs font-black uppercase tracking-widest text-primary">
                  {t("classes.show.students.bulk.requirementsTitle", "CSV Requirements")}
                </AlertTitle>
                <AlertDescription className="text-xs font-bold text-primary/80 mt-1">
                  {t(
                    "classes.show.students.bulk.requirementsText",
                    "Your CSV must include 'name' and 'email' columns. An optional 'password' column can also be provided."
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-muted-foreground/20"
                >
                  {t("buttons.cancel")}
                </Button>
                <Button
                  disabled={!file || loading}
                  onClick={handleUpload}
                  className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                  ) : (
                    <Upload className="h-4 w-4 me-2" />
                  )}
                  {t("buttons.uploadAndEnroll", "Upload & Enroll")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              {/* Success Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-center space-y-1">
                  <p className="text-2xl font-black tracking-tight">{results.enrolled}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    {t("classes.show.students.bulk.statsEnrolled", "Enrolled")}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 text-center space-y-1">
                  <p className="text-2xl font-black tracking-tight">{results.created}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    {t("classes.show.students.bulk.statsCreated", "New Users")}
                  </p>
                </div>
              </div>

              {/* Errors Section */}
              {results.errors.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2 px-1">
                    <AlertCircle className="h-3 w-3" />
                    {t("classes.show.students.bulk.errorsTitle", "Issues Found")} (
                    {results.errors.length})
                  </p>
                  <ScrollArea className="h-40 rounded-2xl border border-destructive/10 bg-destructive/5 p-4">
                    <div className="space-y-3">
                      {results.errors.map((err, i) => (
                        <div key={i} className="flex gap-3 text-[11px] leading-tight">
                          <span className="font-black text-destructive/60 min-w-8">#{err.row}</span>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-foreground truncate">{err.email}</span>
                            <span className="text-destructive font-medium">{err.error}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="h-4 w-4 me-2" />
                {t("buttons.done" as any)}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
