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
  Zap,
  Save,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Check,
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
import {
  useCreate,
  useList,
  useNavigation,
  useCustomMutation,
} from "@refinedev/core";
import { MemoryBoosterList } from "../components/memory-booster-list";
import { SparkleLoader } from "@/components/ai/sparkle-loader";
import { Class } from "@/types";

interface Flashcard {
  front: string;
  back: string;
}

type ToolId = "explain" | "quiz" | "summary" | "flashcards";

interface ToolDefinition {
  id: ToolId;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const AIStudyLab = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("aiHub.studyLab.title"));
  const { list } = useNavigation();
  const [activeTool, setActiveTool] = useState<ToolId>("explain");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<"pos" | "neg" | null>(null);
  const isAr = i18n.language === "ar";

  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const { mutate: createHistory } = useCreate();
  const { mutate: sendFeedback } = useCustomMutation();

  const { result: classesResult } = useList<Class>({
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
    setFeedbackSent(null);

    try {
      if (activeTool === "flashcards") {
        const response = await axios.post<{ flashcards: Flashcard[] }>(
          "/api/ai/generate-flashcards",
          { input, locale: i18n.language, classId: selectedClassId },
          { signal: abortControllerRef.current.signal },
        );
        setFlashcards(response.data.flashcards);
        toast.success(t("aiHub.studyLab.toasts.flashcardsGenerated"));
      } else {
        const prompt =
          activeTool === "explain"
            ? `Explain the following concept in simple terms for a student in ${isAr ? "Arabic" : "English"}: ${input}`
            : `Summarize the following text into key bullet points in ${isAr ? "Arabic" : "English"}: ${input}`;

        const response = await axios.post<{ content: string }>(
          "/api/ai/generate-content",
          { prompt, classId: selectedClassId },
          { signal: abortControllerRef.current.signal },
        );
        setResult(response.data.content);
        toast.success(t("aiHub.studyLab.toasts.aiFinished"));
      }
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        console.log("AI request cancelled.");
      } else {
        toast.error(t("aiHub.studyLab.toasts.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackSent(isPositive ? "pos" : "neg");
    sendFeedback({
      url: "/ai/feedback",
      method: "post",
      values: {
        actionType: `studylab_${activeTool}`,
        isPositive,
        metadata: {
          tool: activeTool,
          topic: input,
          classId: selectedClassId,
        },
      },
    });
  };

  const handleSaveToHistory = () => {
    if (!result && !flashcards) return;

    setIsSaving(true);
    createHistory(
      {
        resource: "ai-activity-logs",
        values: {
          tool: activeTool,
          input: input,
          output: result || JSON.stringify(flashcards),
          metadata: {
            classId: selectedClassId || null,
            language: i18n.language,
          },
        },
      },
      {
        onSuccess: () => {
          setIsSaving(false);
          setHasSaved(true);
          toast.success(
            t("notifications.success", { defaultValue: "Saved to history!" }),
          );
        },
        onError: () => {
          setIsSaving(false);
          toast.error("Failed to save to history.");
        },
      },
    );
  };

  const tools: ToolDefinition[] = [
    {
      id: "explain",
      title: t("aiHub.studyLab.tools.explain.title"),
      desc: t("aiHub.studyLab.tools.explain.desc"),
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "quiz",
      title: t("aiHub.studyLab.tools.quiz.title"),
      desc: t("aiHub.studyLab.tools.quiz.desc"),
      icon: FileQuestion,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      id: "summary",
      title: t("aiHub.studyLab.tools.summary.title"),
      desc: t("aiHub.studyLab.tools.summary.desc"),
      icon: Sparkles,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      id: "flashcards",
      title: t("aiHub.studyLab.tools.flashcards.title"),
      desc: t("aiHub.studyLab.tools.flashcards.desc"),
      icon: Layers,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div
      className="space-y-10 md:space-y-16 pb-20 max-w-7xl mx-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start px-2">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <Card className="glass-card rounded-[2rem] p-6 shadow-sm border-none">
            <div className="space-y-4 text-start">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <Zap className="h-3 w-3" />
                {t("aiHub.studyLab.context.label")}
              </Label>
              <select
                className="w-full h-12 rounded-xl bg-muted/50 border-none px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">{t("classes.list.general")}</option>
                {classesData?.map((cls: Class) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
            {tools.map((tool) => (
              <motion.div
                key={tool.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={cn(
                    "h-full cursor-pointer transition-all duration-500 border border-border/40 shadow-sm rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group relative",
                    activeTool === tool.id
                      ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20"
                      : "bg-card/50 backdrop-blur-3xl hover:bg-primary/5 hover:border-primary/20",
                  )}
                  onClick={() => setActiveTool(tool.id)}
                >
                  {" "}
                  <CardHeader className="p-6 md:p-8 text-start">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-2xl transition-all duration-500 shrink-0 shadow-sm",
                          activeTool === tool.id
                            ? "bg-white/20 text-white"
                            : tool.bg + " " + tool.color,
                        )}
                      >
                        <tool.icon className="h-6 w-6 md:h-7 md:w-7" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-lg md:text-xl font-black tracking-tight truncate">
                          {tool.title}
                        </CardTitle>
                        <CardDescription
                          className={cn(
                            "text-xs md:text-sm font-medium leading-tight",
                            activeTool === tool.id
                              ? "text-white/70"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {tool.desc}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8 md:space-y-12">
          {/* 🧠 MEMORY MISSIONS */}
          <MemoryBoosterList
            onSelectTopic={(topic) => {
              setInput(topic);
              setActiveTool("quiz");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          <AnimatePresence mode="wait">
            {!flashcards ? (
              <motion.div
                key="input-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="ai-card-premium shadow-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-8 md:p-12 pb-6 md:pb-8 text-start bg-primary/5 border-b border-border/40">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Zap className="h-6 w-6 animate-pulse" />
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">
                        {activeTool === "explain" &&
                          t("aiHub.studyLab.questions.understand")}
                        {activeTool === "quiz" &&
                          t("aiHub.studyLab.questions.test")}
                        {activeTool === "summary" &&
                          t("aiHub.studyLab.questions.summary")}
                        {activeTool === "flashcards" &&
                          t("aiHub.studyLab.questions.cards")}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 md:p-12 space-y-8 text-start">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                        {t("aiHub.studyLab.inputLabel")}
                      </Label>
                      {activeTool !== "summary" ? (
                        <Input
                          placeholder={t(
                            `aiHub.studyLab.placeholders.${activeTool}`,
                          )}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          className="h-16 md:h-20 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg md:text-2xl font-black focus-visible:ring-ai-primary/20"
                        />
                      ) : (
                        <Textarea
                          placeholder={t("aiHub.studyLab.placeholderNotes")}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          className="min-h-[300px] rounded-[2rem] bg-muted/30 border-none shadow-inner p-8 text-base md:text-lg leading-relaxed font-medium resize-none"
                        />
                      )}
                    </div>

                    <Button
                      onClick={handleToolAction}
                      disabled={isLoading}
                      size="lg"
                      className={cn(
                        "w-full h-16 md:h-20 rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm gap-4 shadow-2xl transition-all duration-500",
                        isLoading
                          ? "bg-ai-primary animate-ai-pulse"
                          : "shadow-primary/30",
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
                      )}
                      <span>
                        {activeTool === "quiz"
                          ? t("buttons.startPracticeQuiz")
                          : activeTool === "flashcards"
                            ? t("buttons.generateFlashcards")
                            : t("buttons.generateWithAi")}
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="flashcard-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="ai-card-premium shadow-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-border/40 flex flex-row items-center justify-between p-8 md:p-12 text-start">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Layers className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">
                          {t("aiHub.studyLab.flashcardSession")}
                        </CardTitle>
                        <CardDescription className="font-black text-primary/60 uppercase tracking-[0.2em] text-[10px]">
                          {t("aiHub.studyLab.activeRecall")}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-muted/20"
                      onClick={() => setFlashcards(null)}
                    >
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
            {isLoading && <SparkleLoader />}
            {result && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="ai-card-premium shadow-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-ai-primary/10 bg-ai-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-ai-primary/10 text-ai-primary">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-ai-primary">
                          {t("aiHub.studyLab.aiResponse")}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setResult("")}
                        className="rounded-full bg-muted/20"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 md:p-12 prose prose-base lg:prose-xl dark:prose-invert max-w-none text-start">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </CardContent>
                  <div className="p-8 bg-ai-primary/[0.02] border-t border-ai-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* 🔄 AI FEEDBACK LOOP */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {t("aiHub.studyLab.wasHelpful")}
                      </span>
                      <AnimatePresence mode="wait">
                        {!feedbackSent ? (
                          <motion.div
                            key="buttons"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl h-9 w-9 p-0 hover:bg-green-500/10 hover:text-green-600 border-border/40"
                              onClick={() => handleFeedback(true)}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive border-border/40"
                              onClick={() => handleFeedback(false)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="thanks"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10"
                          >
                            {feedbackSent === "pos" ? (
                              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                            ) : (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                              {t("notifications.thankYou")}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button
                      size="lg"
                      variant="ghost"
                      disabled={isSaving || hasSaved}
                      onClick={handleSaveToHistory}
                      className={cn(
                        "w-full md:w-auto rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 h-14 px-8 transition-all",
                        hasSaved
                          ? "text-green-600 bg-green-50"
                          : "text-ai-primary hover:bg-ai-primary/10",
                      )}
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : hasSaved ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      <span>
                        {hasSaved
                          ? t("buttons.save")
                          : t("buttons.saveToHistory")}
                      </span>
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
