import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Briefcase, FileText, Send, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { VerificationUpload } from "@/features/auth/components/verification-upload";

const ApplyTeacherPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [experience, setExperience] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [message, setMessage] = useState("");

  const { mutate, mutation } = useCustomMutation();
  const isLoading = mutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!experience) {
      toast.error("Please describe your teaching experience.");
      return;
    }

    mutate(
      {
        url: "/teacher-applications",
        method: "post",
        values: {
          experience,
          resumeUrl,
          message,
          // classId is omitted for general educator applications
        },
      },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully!");
          navigate("/dashboard");
        },
        onError: (err: any) => {
          toast.error("Failed to submit application: " + (err.message || "Unknown error"));
        },
      }
    );
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] start-[-10%] w-[60%] h-[40%] bg-primary/10 blur-[120px] rounded-full opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <Card className="border-border/40 shadow-3xl rounded-[2.5rem] bg-card/50 backdrop-blur-3xl">
          <CardHeader className="text-center pt-10 pb-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mx-auto border border-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Teacher Portal
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tighter uppercase leading-tight">
              Finalize Application
            </CardTitle>
            <CardDescription className="text-base font-medium max-w-md mx-auto">
              Your account is ready. Now, tell us about your teaching background to gain full
              educator access.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 md:px-12 pb-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                  Teaching Experience
                </Label>
                <Textarea
                  placeholder="Tell us about your years of teaching, subjects, and grade levels..."
                  className="min-h-[120px] rounded-2xl bg-muted/30 border-none p-6 resize-none focus-visible:ring-primary/20"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                  Resume / CV (Optional)
                </Label>
                <VerificationUpload
                  url={resumeUrl}
                  onUpload={(url) => setResumeUrl(url)}
                  onClear={() => setResumeUrl("")}
                />
                <p className="text-[10px] text-muted-foreground ms-2">
                  Upload a PDF or link to your LinkedIn profile.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                  Message to Admins
                </Label>
                <Textarea
                  placeholder="Any additional information you'd like to share..."
                  className="min-h-[80px] rounded-2xl bg-muted/30 border-none p-6 resize-none focus-visible:ring-primary/20"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-xs"
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowLeft className="h-4 w-4 me-2" />
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 h-16 rounded-2xl font-bold uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-primary/30 group"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ApplyTeacherPage;
