import { useShow, useNavigation, useDelete } from "@refinedev/core";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Sparkles, 
  BookOpen, 
  Layers, 
  FileQuestion,
  Calendar,
  ArrowLeft,
  Loader2,
  Trash2,
  Copy,
  Download,
  BrainCircuit,
  User,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const AIHistoryShow = () => {
  const { t, i18n } = useTranslation();
  const { list } = useNavigation();
  const { mutate: deleteRecord } = useDelete();
  const isAr = i18n.language === "ar";

  const { query } = useShow({
    resource: "ai-activity-logs",
  });

  const { data, isLoading } = query;
  const record = data?.data;

  // Fix: Explicitly handling i18n keys to satisfy TypeScript
  const historyLabel = t("resources.ai-history.label", { defaultValue: "AI Study History" });
  usePageTitle(record?.prompt ? `${historyLabel}: ${record.prompt.substring(0, 20)}...` : historyLabel);

  const getToolIcon = (tool?: string) => {
    switch (tool) {
      case "explain": return { icon: BookOpen, label: t("aiHub.studyLab.tools.explain.title"), color: "text-blue-500", bg: "bg-blue-500/10" };
      case "summary": return { icon: Sparkles, label: t("aiHub.studyLab.tools.summary.title"), color: "text-green-500", bg: "bg-green-500/10" };
      case "flashcards": return { icon: Layers, label: t("aiHub.studyLab.tools.flashcards.title"), color: "text-orange-500", bg: "bg-orange-500/10" };
      case "quiz": return { icon: FileQuestion, label: t("aiHub.studyLab.tools.quiz.title"), color: "text-purple-500", bg: "bg-purple-500/10" };
      default: return { icon: History, label: "AI Session", color: "text-primary", bg: "bg-primary/10" };
    }
  };

  const handleCopy = () => {
    if (record?.response) {
      navigator.clipboard.writeText(record.response);
      toast.success(t("toasts.copiedToClipboard", { defaultValue: "Copied to clipboard!" }));
    }
  };

  const handleDownload = () => {
    if (!record) return;
    
    const content = `AI Study Session\n\nPrompt: ${record.prompt}\n\nTool: ${record.action}\n\nDate: ${format(new Date(record.createdAt), "PPPP")}\n\nResponse:\n\n${record.response}`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ai-study-${record.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(t("toasts.downloadStarted", { defaultValue: "Download started!" }));
  };

  const handleDelete = () => {
    if (!record?.id) return;
    
    if (confirm(t("messages.confirmDelete", { defaultValue: "Are you sure you want to delete this history item?" }))) {
        deleteRecord(
            {
                resource: "ai-activity-logs",
                id: record.id,
            },
            {
                onSuccess: () => {
                    toast.success(t("toasts.deletedSuccessfully", { defaultValue: "Deleted successfully" }));
                    list("ai-activity-logs");
                }
            }
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
        <p className="text-muted-foreground font-bold animate-pulse">Retrieving your AI notes...</p>
      </div>
    );
  }

  const toolInfo = getToolIcon(record?.action);

  return (
    <div className="space-y-8 md:space-y-12 pb-20 max-w-5xl mx-auto px-4" dir={isAr ? "rtl" : "ltr"}>
      {/* Header Actions */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-4">
            <Breadcrumb />
            <Button 
                variant="ghost" 
                onClick={() => list("ai-activity-logs")}
                className="group rounded-xl font-bold gap-2 -ml-2"
            >
                <ArrowLeft className={cn("h-4 w-4 transition-transform group-hover:-translate-x-1", isAr && "rotate-180 group-hover:translate-x-1")} />
                {t("buttons.backToList", { defaultValue: "Back to History" })}
            </Button>
        </div>

        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl font-bold gap-2 h-11 border-border/40 bg-card/50">
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">{t("buttons.copy", { defaultValue: "Copy" })}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl font-bold gap-2 h-11 border-border/40 bg-card/50">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t("buttons.export", { defaultValue: "Export" })}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="rounded-xl font-bold gap-2 h-11 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("buttons.delete", { defaultValue: "Delete" })}</span>
            </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        {/* The Prompt / Question */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Card className="border-border/40 bg-card/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-sm">
                <CardHeader className="p-8 md:p-10 border-b border-border/40 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/5">
                                <User className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{t("aiHub.studyLab.inputLabel")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            <Calendar className="h-3 w-3" />
                            {record?.createdAt && format(new Date(record.createdAt), "PPPP")}
                        </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                        {record?.prompt}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10 flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/40">
                        <div className={cn("p-1.5 rounded-lg", toolInfo.bg, toolInfo.color)}>
                            <toolInfo.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">{toolInfo.label}</span>
                    </div>
                    {record?.metadata?.classId && (
                        <div className="flex items-center gap-3 bg-indigo-500/5 px-4 py-2 rounded-2xl border border-indigo-500/10">
                            <BrainCircuit className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-bold text-indigo-500">Context: Class #{record.metadata.classId}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>

        {/* The AI Response */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="border-border/40 bg-card/60 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="p-8 md:p-12 pb-6 md:pb-8 border-b border-indigo-500/10 bg-indigo-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-sm animate-pulse">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                                {t("aiHub.studyLab.aiResponse")}
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-indigo-500/60 mt-1">
                                Generated by Classroom AI
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 md:p-16 pt-10 md:pt-14 text-start selection:bg-indigo-500/20">
                    <div className="prose prose-base md:prose-lg lg:prose-xl dark:prose-invert max-w-none font-medium leading-relaxed text-foreground/90">
                        {record?.action === "flashcards" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose mt-4">
                                {JSON.parse(record.response || "[]").map((card: any, i: number) => (
                                    <div key={i} className="p-6 rounded-[2rem] bg-muted/30 border border-border/40 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">Card #{i+1}</div>
                                        <div className="font-black text-lg leading-tight">{card.front}</div>
                                        <div className="h-px bg-border/40 w-full" />
                                        <div className="text-muted-foreground font-medium">{card.back}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ReactMarkdown>{record?.response}</ReactMarkdown>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AIHistoryShow;
