import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, FileText, Download, MessageSquareQuote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Submission } from "@/types";

interface GradingStudentWorkProps {
  submission: Submission;
}

export const GradingStudentWork = ({ submission }: GradingStudentWorkProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!submission?.content) return;
    navigator.clipboard.writeText(submission.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-[7] bg-muted/10 overflow-hidden flex flex-col border-e">
      <ScrollArea className="flex-1 p-8 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t("assignments.grading.studentWork")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2"
              >
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {t("buttons.copy")}
              </Button>
            </div>

            <div className="bg-card p-10 rounded-4xl shadow-sm border leading-relaxed text-lg font-medium italic min-h-[400px] relative">
              <MessageSquareQuote className="absolute top-6 start-6 h-12 w-12 text-primary/5 -scale-x-100" />
              <div className="relative z-10 whitespace-pre-wrap">{submission.content}</div>
            </div>
          </div>

          {submission.fileUrl && (
            <div className="p-6 border-2 border-dashed rounded-4xl bg-primary/5 border-primary/10 flex items-center justify-between group hover:bg-primary/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">
                    {t("assignments.grading.attachedDoc")}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("assignments.grading.viewOrDownload")}
                  </p>
                </div>
              </div>
              <Button
                className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                asChild
              >
                <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4 me-2" />
                  {t("buttons.open")}
                </a>
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
