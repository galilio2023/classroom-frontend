import { useState } from "react";
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
  Info
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

const AIStudyLab = () => {
  usePageTitle("AI Study Lab");
  const [activeTool, setActiveTool] = useState<"explain" | "quiz" | "summary" | "flashcards">(
    "explain",
  );
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<any[] | null>(null);

  const handleToolAction = async () => {
    if (!input.trim()) {
      toast.error("Please enter a topic or text first.");
      return;
    }

    if (activeTool === "quiz") {
      setPracticeTopic(input);
      return;
    }

    setIsLoading(true);
    setResult("");
    setFlashcards(null);

    try {
      if (activeTool === "flashcards") {
        const response = await axios.post("/api/ai/generate-flashcards", { input });
        setFlashcards(response.data.flashcards);
        toast.success("Flashcards generated!");
      } else {
        const prompt =
          activeTool === "explain"
            ? `Explain the following concept in simple terms for a student: ${input}`
            : `Summarize the following text into key bullet points: ${input}`;

        const response = await axios.post("/api/ai/generate-content", { prompt });
        setResult(response.data.content);
        toast.success("AI has finished processing!");
      }
    } catch (error) {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-6xl space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
                    <BrainCircuit className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight">AI Study Lab</h1>
                    <p className="text-muted-foreground font-medium mt-1">Your private space to practice, learn, and master any topic with AI assistance.</p>
                </div>
            </div>
            <Button variant="outline" className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/10 bg-card/50 backdrop-blur-sm">
                <History className="h-4 w-4" />
                Study History
            </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Tool Selection Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {[
            { id: "explain", title: "Concept Explainer", desc: "Simplify difficult topics instantly.", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
            { id: "quiz", title: "Practice Quiz", desc: "Test your knowledge privately.", icon: FileQuestion, color: "text-purple-500", bg: "bg-purple-500/10" },
            { id: "summary", title: "Smart Summarizer", desc: "Turn long notes into key points.", icon: Sparkles, color: "text-green-500", bg: "bg-green-500/10" },
            { id: "flashcards", title: "Flashcard Gen", desc: "Generate cards for active recall.", icon: Layers, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((tool) => (
            <motion.div
                key={tool.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
            >
                <Card
                    className={cn(
                        "cursor-pointer transition-all border-none shadow-lg rounded-2xl overflow-hidden group",
                        activeTool === tool.id
                            ? "bg-primary text-primary-foreground shadow-primary/20"
                            : "bg-card/50 backdrop-blur-sm hover:bg-primary/5"
                    )}
                    onClick={() => setActiveTool(tool.id as any)}
                >
                    <CardHeader className="p-5">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                activeTool === tool.id ? "bg-white/20 text-white" : tool.bg + " " + tool.color
                            )}>
                                <tool.icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-black tracking-tight">{tool.title}</CardTitle>
                                <CardDescription className={cn(
                                    "text-xs font-medium",
                                    activeTool === tool.id ? "text-white/70" : "text-muted-foreground"
                                )}>
                                    {tool.desc}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>
          ))}

          <Card className="mt-8 border-primary/10 bg-primary/5 rounded-[2rem] p-6">
            <div className="flex gap-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary h-fit">
                    <Lightbulb className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <p className="font-black text-xs uppercase tracking-widest text-primary">Study Tip</p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        Use the **Summarizer** first to get key points, then generate **Flashcards** from those points for the best retention.
                    </p>
                </div>
            </div>
          </Card>
        </div>

        {/* Main Interaction Area */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!flashcards ? (
                <motion.div
                    key="input-area"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                >
                    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 pb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="h-5 w-5 text-primary animate-pulse" />
                                <CardTitle className="text-2xl font-black tracking-tight">
                                    {activeTool === "explain" && "What would you like to understand?"}
                                    {activeTool === "quiz" && "What topic should we test?"}
                                    {activeTool === "summary" && "Paste the text you want to summarize"}
                                    {activeTool === "flashcards" && "What topic or text should we turn into cards?"}
                                </CardTitle>
                            </div>
                            <CardDescription className="font-medium text-base">
                                Provide the subject or content below and our AI will handle the rest.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Input Content</Label>
                                {activeTool === "quiz" || activeTool === "explain" || activeTool === "flashcards" ? (
                                    <Input
                                        placeholder={
                                            activeTool === "quiz"
                                            ? "e.g., Photosynthesis, Quantum Physics..."
                                            : activeTool === "flashcards"
                                            ? "e.g., French Revolution, Human Anatomy..."
                                            : "e.g., How do black holes work?"
                                        }
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="h-16 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary font-black text-lg px-6"
                                    />
                                ) : (
                                    <Textarea
                                        placeholder="Paste your notes or textbook content here..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="min-h-[250px] rounded-[2rem] bg-muted/30 border-none focus-visible:ring-primary p-8 text-base leading-relaxed font-medium resize-none"
                                    />
                                )}
                            </div>

                            <Button
                                onClick={handleToolAction}
                                disabled={isLoading}
                                className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-primary/20 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                )}
                                {activeTool === "quiz"
                                    ? "Start Practice Quiz"
                                    : activeTool === "flashcards"
                                    ? "Generate Flashcards"
                                    : "Generate with AI"}
                                {!isLoading && <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
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
                >
                    <Card className="shadow-2xl border-none bg-card/50 backdrop-blur-xl rounded-[3rem] overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <Layers className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">Flashcard Session</CardTitle>
                                    <CardDescription className="font-bold text-primary/60 uppercase tracking-widest text-[10px]">Active Recall Mode</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-destructive/5 hover:text-destructive" onClick={() => setFlashcards(null)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-12">
                            <FlashcardPlayer 
                                cards={flashcards} 
                                onComplete={() => setFlashcards(null)} 
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <Card className="border-none shadow-2xl bg-indigo-500/[0.02] backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-indigo-500/10">
                        <CardHeader className="p-10 pb-6 border-b border-indigo-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                    AI Response
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </CardContent>
                        <div className="p-8 bg-indigo-500/5 border-t border-indigo-500/10 flex justify-end">
                            <Button variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 text-indigo-600 hover:bg-indigo-500/10">
                                <History className="h-4 w-4" />
                                Save to History
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
