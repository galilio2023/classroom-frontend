import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  BookOpen,
  FileQuestion,
  BrainCircuit,
  Loader2,
  History,
  Layers,
  X,
  ArrowRight,
  Zap,
  Lightbulb,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { PracticeModal } from "@/components/practice/practice-modal";
import { FlashcardPlayer } from "@/components/practice/flashcard-player";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useCreate, useList, useNavigation } from "@refinedev/core";

const AIStudyLab = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("aiHub.studyLab.title"));
  const { list } = useNavigation();
  const [activeTool, setActiveTool] = useState<"explain" | "quiz" | "summary" | "flashcards">(
    "explain",
  );
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const isAr = i18n.language === "ar";

  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<any[] | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const { mutate: createHistory } = useCreate();

  // Refine v5 Fix: destructure 'result' correctly
  const { result: classesResult } = useList({
    resource: "classes",
    pagination: { pageSize: 100 },
  });

  const classesData = classesResult?.data || [];

  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleToolAction = async () => {
    if (!input.trim()) {
      toast.error(t("aiHub.studyLab.toasts.enterTopic"));
      return;
    }

    if (activeTool === "quiz") {
      setPracticeTopic(input);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setResult("");
    setFlashcards(null);
    setHasSaved(false);

    try {
      if (activeTool === "flashcards") {
        const response = await axios.post(
            "/api/ai/generate-flashcards", 
            { input, locale: i18n.language, classId: selectedClassId },
            { signal: abortControllerRef.current.signal }
        );
        setFlashcards(response.data.flashcards);
        toast.success(t("aiHub.studyLab.toasts.flashcardsGenerated"));
      } else {
        const prompt =
          activeTool === "explain"
            ? `Explain the following concept in simple terms for a student in ${isAr ? 'Arabic' : 'English'}: ${input}`
            : `Summarize the following text into key bullet points in ${isAr ? 'Arabic' : 'English'}: ${input}`;

        const response = await axios.post(
            "/api/ai/generate-content", 
            { prompt, classId: selectedClassId },
            { signal: abortControllerRef.current.signal }
        );
        setResult(response.data.content);
        toast.success(t("aiHub.studyLab.toasts.aiFinished"));
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("AI request cancelled by component unmount or new request.");
      } else {
        toast.error(t("aiHub.studyLab.toasts.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!result && !flashcards) return;
    
    setIsSaving(true);
    createHistory({
      resource: "ai-activity-logs",
      values: {
        tool: activeTool,
        input: input,
        output: result || JSON.stringify(flashcards),
        metadata: {
            classId: selectedClassId || null,
            language: i18n.language,
        }
      },
    }, {
      onSuccess: () => {
        setIsSaving(false);
        setHasSaved(true);
        // Fix: Use a key that exists or provide a default value to bypass strict i18n typing
        toast.success(t("notifications.success", { defaultValue: "Saved to history!" }));
      },
      onError: () => {
        setIsSaving(false);
        toast.error("Failed to save to history.");
      }
    });
  };

  const tools = [
    { id: "explain", title: t("aiHub.studyLab.tools.explain.title"), desc: t("aiHub.studyLab.tools.explain.desc"), icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "quiz", title: t("aiHub.studyLab.tools.quiz.title"), desc: t("aiHub.studyLab.tools.quiz.desc"), icon: FileQuestion, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "summary", title: t("aiHub.studyLab.tools.summary.title"), desc: t("aiHub.studyLab.tools.summary.desc"), icon: Sparkles, color: "text-green-500", bg: "bg-green-500/10" },
    { id: "flashcards", title: t("aiHub.studyLab.tools.flashcards.title"), desc: t("aiHub.studyLab.tools.flashcards.desc"), icon: Layers, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-10 md:space-y-16 pb-20 max-w-7xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 md:space-y-6 text-start px-2"
      >
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                    <BrainCircuit className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">
                        {t("aiHub.studyLab.title")}
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-xl text-balance">
                        {t("aiHub.studyLab.description")}
                    </p>
                </div>
            </div>
            <Button 
                variant="outline" 
                size="lg" 
                onClick={() => list("ai-activity-logs")}
                className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-8 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold uppercase tracking-widest text-[10px] shadow-sm gap-2"
            >
                <History className="h-4 w-4" />
                {t("buttons.studyHistory")}
            </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Tool Selection Sidebar */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          
          {/* Context Selector: Class selection for contextual AI */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-3xl rounded-[2rem] p-6 shadow-sm">
              <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    {t("aiHub.studyLab.context.title", { defaultValue: "Study Context" })}
                  </Label>
                  <select
                    className="w-full h-12 rounded-xl bg-muted/50 border-none px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">{t("aiHub.studyLab.context.general", { defaultValue: "General Knowledge" })}</option>
                    {classesData?.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground italic px-2 leading-tight">
                    {t("aiHub.studyLab.context.help", { defaultValue: "Selecting a class helps the AI understand your specific curriculum." })}
                  </p>
              </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
            {tools.map((tool) => (
                <motion.div
                    key={tool.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                >
                    <Card
                        className={cn(
                            "h-full cursor-pointer transition-all duration-300 border border-border/40 shadow-sm rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group relative",
                            activeTool === tool.id
                                ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20"
                                : "bg-card/50 backdrop-blur-3xl hover:bg-primary/5 hover:border-primary/20"
                        )}
                        onClick={() => setActiveTool(tool.id as any)}
                    >
                        {/* Selected Accent */}
                        {activeTool === tool.id && (
                            <div className="absolute left-0 top-0 w-1.5 h-full bg-white/20" />
                        )}

                        <CardHeader className="p-6 md:p-8 text-start">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-2xl transition-all duration-500 shrink-0 shadow-sm",
                                    activeTool === tool.id ? "bg-white/20 text-white" : tool.bg + " " + tool.color
                                )}>
                                    <tool.icon className="h-6 w-6 md:h-7 md:w-7" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <CardTitle className="text-lg md:text-xl font-black tracking-tight truncate">{tool.title}</CardTitle>
                                    <CardDescription className={cn(
                                        "text-xs md:text-sm font-medium leading-tight",
                                        activeTool === tool.id ? "text-white/70" : "text-muted-foreground/70"
                                    )}>
                                        {tool.desc}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>
            ))}
          </div>

          <Card className="border-border/40 bg-primary/5 rounded-[2rem] md:rounded-[2.5rem] p-8 text-start shadow-xl shadow-primary/5 border-2 border-dashed backdrop-blur-sm">
            <div className="flex gap-5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary h-fit shrink-0">
                    <Lightbulb className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">{t("aiHub.studyLab.studyTip")}</p>
                    <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed italic">
                        "{t("aiHub.studyLab.studyTipDesc")}"
                    </p>
                </div>
            </div>
          </Card>
        </div>

        {/* Main Interaction Area */}
        <div className="lg:col-span-8 space-y-8 md:space-y-12">
          <AnimatePresence mode="wait">
            {!flashcards ? (
                <motion.div
                    key="input-area"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Card className="border-border/40 shadow-2xl bg-card/50 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-8 md:p-12 pb-6 md:pb-8 text-start bg-primary/5 border-b border-border/40">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                                    <Zap className="h-6 w-6 animate-pulse" />
                                </div>
                                <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">
                                    {activeTool === "explain" && t("aiHub.studyLab.questions.understand")}
                                    {activeTool === "quiz" && t("aiHub.studyLab.questions.test")}
                                    {activeTool === "summary" && t("aiHub.studyLab.questions.summary")}
                                    {activeTool === "flashcards" && t("aiHub.studyLab.questions.cards")}
                                </CardTitle>
                            </div>
                            <CardDescription className="font-medium text-base md:text-lg text-muted-foreground/70">
                                {t("aiHub.studyLab.questions.sub")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 space-y-8 text-start">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">{t("aiHub.studyLab.inputLabel")}</Label>
                                {activeTool === "quiz" || activeTool === "explain" || activeTool === "flashcards" ? (
                                    <Input
                                        placeholder={
                                            activeTool === "quiz"
                                            ? t("aiHub.studyLab.placeholders.quiz")
                                            : activeTool === "flashcards"
                                            ? t("aiHub.studyLab.placeholders.flashcards")
                                            : t("aiHub.studyLab.placeholders.explain")
                                        }
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="h-16 md:h-20 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg md:text-2xl font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                    />
                                ) : (
                                    <Textarea
                                        placeholder={t("aiHub.studyLab.placeholderNotes")}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="min-h-[250px] md:min-h-[400px] rounded-[2rem] md:rounded-[3rem] bg-muted/30 border-none shadow-inner p-8 md:p-12 text-base md:text-xl leading-relaxed font-medium resize-none focus-visible:ring-primary/20"
                                    />
                                )}
                            </div>

                            <Button
                                onClick={handleToolAction}
                                disabled={isLoading}
                                size="lg"
                                className="w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm gap-4 shadow-2xl shadow-primary/30 group transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="truncate">
                                    {activeTool === "quiz"
                                        ? t("buttons.startPracticeQuiz")
                                        : activeTool === "flashcards"
                                        ? t("buttons.generateFlashcards")
                                        : t("buttons.generateWithAi")}
                                </span>
                                {!isLoading && <ArrowRight className={cn("hidden sm:block h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all", isAr && "rotate-180 mr-2 ml-0 group-hover:-translate-x-2")} />}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    key="flashcard-area"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Card className="shadow-2xl border-border/40 bg-card/50 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-border/40 flex flex-row items-center justify-between p-8 md:p-12 text-start">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                                    <Layers className="h-8 w-8" />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-2xl md:text-3xl font-black tracking-tight truncate">{t("aiHub.studyLab.flashcardSession")}</CardTitle>
                                    <CardDescription className="font-black text-primary/60 uppercase tracking-[0.2em] text-[10px] md:text-xs truncate">{t("aiHub.studyLab.activeRecall")}</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0 bg-muted/20" onClick={() => setFlashcards(null)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 md:p-16">
                            <FlashcardPlayer 
                                cards={flashcards} 
                                onComplete={() => setFlashcards(null)} 
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Card className="border-border/40 shadow-2xl bg-indigo-500/[0.03] backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-8 md:p-12 pb-6 md:pb-8 border-b border-indigo-500/10 text-start bg-indigo-500/5">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-sm">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                                        {t("aiHub.studyLab.aiResponse")}
                                    </CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setResult("")} className="h-10 w-10 rounded-full bg-muted/20 hover:bg-destructive/10 hover:text-destructive">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 prose prose-base md:prose-lg lg:prose-xl dark:prose-invert max-w-none font-medium leading-relaxed text-start selection:bg-indigo-500/20">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </CardContent>
                        <div className="p-8 md:p-10 bg-indigo-500/[0.05] border-t border-indigo-500/10 flex justify-end">
                            <Button 
                              size="lg" 
                              variant="ghost" 
                              disabled={isSaving || hasSaved}
                              onClick={handleSaveToHistory}
                              className={cn(
                                "rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 h-14 px-8 transition-all",
                                hasSaved ? "text-green-600 bg-green-50" : "text-indigo-600 hover:bg-indigo-500/10"
                              )}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : hasSaved ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                <span>{hasSaved ? t("buttons.saved", { defaultValue: "Saved" }) : t("buttons.saveToHistory")}</span>
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {practiceTopic && (
        <PracticeModal
          topic={practiceTopic}
          subjectId={0}
          onClose={() => setPracticeTopic(null)}
        />
      )}
    </div>
  );
};

export default AIStudyLab;
