import { useCustom } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Loader2, 
  AlertCircle,
  ClipboardCopy,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StudentInsightContent } from "./ai/student-insight-content";

interface AIInsight {
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string;
  summary: string;
}

interface AIStudentInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  classId: string;
}

export const AIStudentInsightModal = ({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName, 
  classId 
}: AIStudentInsightModalProps) => {
  const { data: insightData, isLoading, isError, refetch } = useCustom<AIInsight>({
    url: `/ai/student-insight/${studentId}/${classId}`,
    method: "get",
    queryOptions: {
      enabled: isOpen && !!studentId && !!classId,
    },
  }) as any;

  const insight = insightData?.data;

  const handleCopy = () => {
    if (!insight) return;
    const text = `AI Insight for ${studentName}:\n\nStrengths:\n${insight.strengths.join("\n")}\n\nWeaknesses:\n${insight.weaknesses.join("\n")}\n\nImprovement Plan:\n${insight.improvementPlan}\n\nSummary:\n${insight.summary}`;
    navigator.clipboard.writeText(text);
    toast.success("Insight copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            AI Student Insight: {studentName}
          </DialogTitle>
          <DialogDescription>
            Deep analysis of performance, attendance, and engagement.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Analyzing student data with Gemini AI...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="space-y-1">
                <p className="font-semibold">Failed to generate insight</p>
                <p className="text-sm text-muted-foreground">
                  There was an error connecting to the AI service.
                </p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : insight ? (
            <StudentInsightContent insight={insight} />
          ) : null}
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!insight}>
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copy Insight
          </Button>
          <Button size="sm" disabled={!insight} onClick={() => toast.info("Feature coming soon: Send to Student")}>
            <Send className="h-4 w-4 mr-2" />
            Send to Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
