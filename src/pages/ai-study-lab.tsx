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
  X
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { PracticeModal } from "@/components/practice/practice-modal";
import { FlashcardPlayer } from "@/components/practice/flashcard-player";
import { cn } from "@/lib/utils";

const AIStudyLab = () => {
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
    <div className="container mx-auto py-10 px-4 md:px-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            AI Study Lab
          </h1>
          <p className="text-muted-foreground mt-1">
            Your private space to practice, learn, and master any topic.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <History className="h-4 w-4" />
          Study History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              activeTool === "explain"
                ? "border-primary bg-primary/5 shadow-md"
                : "",
            )}
            onClick={() => setActiveTool("explain")}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    activeTool === "explain"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Concept Explainer</CardTitle>
                  <CardDescription className="text-xs text-balance">
                    Simplify difficult topics instantly.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              activeTool === "quiz"
                ? "border-primary bg-primary/5 shadow-md"
                : "",
            )}
            onClick={() => setActiveTool("quiz")}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    activeTool === "quiz"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <FileQuestion className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Practice Quiz</CardTitle>
                  <CardDescription className="text-xs text-balance">
                    Test your knowledge privately.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              activeTool === "summary"
                ? "border-primary bg-primary/5 shadow-md"
                : "",
            )}
            onClick={() => setActiveTool("summary")}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    activeTool === "summary"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Smart Summarizer</CardTitle>
                  <CardDescription className="text-xs text-balance">
                    Turn long notes into key points.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              activeTool === "flashcards"
                ? "border-primary bg-primary/5 shadow-md"
                : "",
            )}
            onClick={() => setActiveTool("flashcards")}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    activeTool === "flashcards"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Flashcard Maker</CardTitle>
                  <CardDescription className="text-xs text-balance">
                    Generate cards for active recall.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!flashcards ? (
            <Card className="shadow-xl border-none bg-card/50 backdrop-blur-xl">
                <CardHeader>
                <CardTitle>
                    {activeTool === "explain" && "What would you like to understand?"}
                    {activeTool === "quiz" && "What topic should we test?"}
                    {activeTool === "summary" && "Paste the text you want to summarize"}
                    {activeTool === "flashcards" && "What topic or text should we turn into cards?"}
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    className="h-12 text-lg"
                    />
                ) : (
                    <Textarea
                    placeholder="Paste your notes or textbook content here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-50 text-base"
                    />
                )}

                <Button
                    onClick={handleToolAction}
                    disabled={isLoading}
                    className="w-full h-12 text-lg font-bold gap-2 shadow-lg shadow-primary/20"
                >
                    {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                    <Sparkles className="h-5 w-5" />
                    )}
                    {activeTool === "quiz"
                    ? "Start Practice Quiz"
                    : activeTool === "flashcards"
                    ? "Generate Flashcards"
                    : "Generate with AI"}
                </Button>
                </CardContent>
            </Card>
          ) : (
            <Card className="shadow-2xl border-none bg-card/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Flashcard Session
                        </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFlashcards(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-10 pb-10">
                    <FlashcardPlayer 
                        cards={flashcards} 
                        onComplete={() => setFlashcards(null)} 
                    />
                </CardContent>
            </Card>
          )}

          {result && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-primary/20 bg-primary/5">
              <CardHeader className="border-b border-primary/10">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 prose dark:prose-invert max-w-none pb-6">
                <ReactMarkdown>{result}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {practiceTopic && (
        <PracticeModal
          topic={practiceTopic}
          subjectId={0} // Default to 0 for general practice
          onClose={() => setPracticeTopic(null)}
        />
      )}
    </div>
  );
};

export default AIStudyLab;
