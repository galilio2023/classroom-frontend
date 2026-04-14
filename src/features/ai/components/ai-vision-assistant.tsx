import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Upload,
  Sparkles,
  Loader2,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  X,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AIFeedback } from "@/features/ai/components/ai-feedback";
import { useAiVision, AnalysisResponse } from "@/features/ai/hooks/use-ai-vision";
import { AiFeatureGuard } from "@/features/ai/components/AiFeatureGuard";

export const AIVisionAssistant = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { analyzeWhiteboard, isLoading: isAnalyzing } = useAiVision();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ðŸ›¡ï¸ SECURITY: Explicit MIME type validation
      if (!file.type.startsWith("image/")) {
        toast.error("File is not an image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max size is 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.analysis);
    setCopied(true);
    toast.success("Explanation copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const analyzeImage = () => {
    if (!image) return;

    const base64Data = image.split(",")[1];

    analyzeWhiteboard(base64Data, {
      onSuccess: (data) => {
        // Result is now normalized by the hook
        setResult(data);
        toast.success("Vision analysis complete!");
      },
      onError: (err) => {
        console.error("Vision Analysis Error:", err);
        toast.error("AI was unable to process this image.");
      },
    });
  };

  return (
    <AiFeatureGuard>
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-3xl border-2 border-dashed border-primary/20">
          <CardContent className="p-10">
            {!image ? (
              <div
                className="flex flex-col items-center justify-center py-20 gap-6 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Snapshot & Solve</h3>
                  <p className="text-muted-foreground font-medium max-w-sm">
                    Upload a photo of your physical whiteboard, textbook, or a screenshot for
                    instant AI reasoning.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full font-black uppercase tracking-widest text-[10px] px-8 h-12"
                  onClick={(e) => {
                    e.stopPropagation(); // ðŸ›¡ï¸ Fix event bubbling
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 me-2" />
                  Select Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative aspect-video max-h-[400px] w-full rounded-[2rem] overflow-hidden border border-border/40 shadow-2xl group">
                  <img
                    src={image}
                    alt="Preview"
                    className="h-full w-full object-contain bg-black/5"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full font-bold uppercase tracking-widest text-[10px]"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4 me-2" />
                      Discard
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="h-14 rounded-full px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-5 w-5 animate-spin me-3" />
                    ) : (
                      <Sparkles className="h-5 w-5 me-3" />
                    )}
                    {isAnalyzing ? "AI is Thinking..." : "Analyze Snapshot"}
                  </Button>
                  {!isAnalyzing && (
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-14 w-14 rounded-full p-0 border-border/40"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <Card className="ai-card-premium overflow-hidden">
                <div className="ai-glow opacity-10" />
                <CardHeader className="p-8 border-b border-border/40 bg-amber-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500 p-2 rounded-xl">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-black uppercase tracking-tight">
                        AI Explanation
                      </CardTitle>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 rounded-xl font-black uppercase text-[10px] gap-2"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-base leading-relaxed font-medium text-foreground/80 whitespace-pre-wrap text-start">
                    {result.analysis}
                  </p>
                </CardContent>
              </Card>
              <Card className="ai-card-premium overflow-hidden">
                <div className="ai-glow opacity-10" />
                <CardHeader className="p-8 border-b border-border/40 bg-blue-500/5">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-xl">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight">
                      Follow-up Questions
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {result.followUpQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-5 rounded-2xl bg-muted/30 border border-border/50 group hover:bg-muted/50 transition-all"
                    >
                      <div className="h-8 w-8 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-xs font-black shrink-0 text-primary">
                        {i + 1}
                      </div>
                      <p className="text-sm md:text-base font-bold text-foreground/80 leading-snug pt-1 text-start">
                        {q}
                      </p>
                      <ChevronRight className="h-5 w-5 ms-auto text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4"
          >
            <AIFeedback
              actionType="vision_analysis"
              metadata={{
                hasImage: !!image,
                followUpCount: result.followUpQuestions.length,
              }}
            />
          </motion.div>
        )}
      </div>
    </AiFeatureGuard>
  );
};
