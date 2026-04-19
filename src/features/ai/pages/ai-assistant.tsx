import React from "react";
import { AIAssignmentHelper } from "@/features/ai/components/ai-assignment-helper";
import { AIQuizGenerator } from "@/features/ai/components/ai-quiz-generator";
import { AIVisionAssistant } from "@/features/ai/components/ai-vision-assistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, BrainCircuit, LayoutDashboard, Info, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { AiFeatureGuard } from "@/features/ai/components/AiFeatureGuard";

/**
 * 🛡️ PERFORMANCE FIX: Memoize the entire Tabs content to isolate it from
 * the high-frequency 'useDashboard' coreData updates.
 * This prevents the AI Hub from freezing when real-time pulse events occur.
 */
const MemoizedAiFeatures = React.memo(() => {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="assignment" className="w-full space-y-8 md:space-y-12">
      <div className="sticky top-20 z-40">
        <div className="rounded-3xl border border-border/40 bg-background/40 backdrop-blur-3xl p-1.5 shadow-2xl shadow-black/5">
          <TabsList className="grid w-full grid-cols-3 h-12 md:h-14 bg-muted/20 gap-1 rounded-[1.25rem]">
            <TabsTrigger
              value="assignment"
              className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 md:gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
            >
              <FileText className="h-4 w-4 md:h-5 md:w-5" />
              {t("aiHub.assistant.architect")}
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 md:gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
            >
              <BrainCircuit className="h-4 w-4 md:h-5 md:w-5" />
              {t("aiHub.assistant.generator")}
            </TabsTrigger>
            <TabsTrigger
              value="vision"
              className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 md:gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
            >
              <Camera className="h-4 w-4 md:h-5 md:w-5" />
              {t("aiHub.assistant.vision")}
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <TabsContent value="assignment" className="mt-0 focus-visible:outline-none">
            <AiFeatureGuard>
              <AIAssignmentHelper />
            </AiFeatureGuard>
          </TabsContent>

          <TabsContent value="quiz" className="mt-0 focus-visible:outline-none">
            <AiFeatureGuard>
              <AIQuizGenerator />
            </AiFeatureGuard>
          </TabsContent>

          <TabsContent value="vision" className="mt-0 focus-visible:outline-none">
            <AIVisionAssistant />
          </TabsContent>
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
});
MemoizedAiFeatures.displayName = "MemoizedAiFeatures";

export const AIAssistantPage: React.FC = () => {
  const { t } = useTranslation();
  const { coreData } = useDashboard();
  usePageTitle(t("aiHub.assistant.title"));

  const isDryRun = coreData?.globalConfig?.isDryRun;

  return (
    <div className="space-y-10 md:space-y-16 pb-20 max-w-7xl mx-auto">
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
              <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">
                {t("aiHub.assistant.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl text-balance">
                {t("aiHub.assistant.description")}
              </p>
            </div>
          </div>
        </div>

        {isDryRun && (
          <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-600 rounded-2xl md:rounded-3xl border-2 border-dashed max-w-2xl">
            <Info className="h-5 w-5 text-orange-600" />
            <div className={cn("ms-2")}>
              <AlertTitle className="font-black text-xs uppercase tracking-widest">
                {t("aiHub.assistant.mockMode")}
              </AlertTitle>
              <AlertDescription className="text-xs font-bold leading-relaxed">
                {t("aiHub.assistant.mockModeDesc")}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          <MemoizedAiFeatures />
        </div>

        {/* Sidebar Capabilities */}
        <div className="lg:col-span-4 space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 sticky top-24"
          >
            <Card className="border-border/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-3xl">
              <CardHeader className="bg-primary/5 border-b border-border/40 p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">
                    {t("aiHub.assistant.capabilities")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 md:p-10 space-y-8">
                <div className="flex gap-5 group">
                  <div className="h-12 w-12 rounded-[1.25rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-600/70">
                      {t("aiHub.assistant.rubrics")}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
                      {t("aiHub.assistant.rubricsDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="h-12 w-12 rounded-[1.25rem] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <BrainCircuit className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] text-purple-600/70">
                      {t("aiHub.assistant.quizzes")}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
                      {t("aiHub.assistant.quizzesDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="h-12 w-12 rounded-[1.25rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <Camera className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] text-orange-600/70">
                      {t("aiHub.assistant.vision")}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
                      {t("aiHub.assistant.visionDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="h-12 w-12 rounded-[1.25rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <LayoutDashboard className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] text-green-600/70">
                      {t("aiHub.assistant.drafts")}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
                      {t("aiHub.assistant.draftsDesc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="rounded-[2.5rem] border-primary/20 bg-primary/5 p-8 shadow-xl shadow-primary/5 backdrop-blur-sm border-2 border-dashed">
              <Info className="h-6 w-6 text-primary mt-1" />
              <div className={cn("ms-4")}>
                <AlertTitle className="font-black text-xs uppercase tracking-[0.2em] mb-3 text-primary">
                  {t("aiHub.assistant.proTip")}
                </AlertTitle>
                <AlertDescription className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed italic">
                  "{t("aiHub.assistant.proTipDesc")}"
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
