import React from "react";
import { AIAssignmentHelper } from "@/components/ai-assignment-helper";
import { AIQuizGenerator } from "@/components/ai-quiz-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, BrainCircuit, LayoutDashboard, ArrowRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

export const AIAssistantPage: React.FC = () => {
  const { t } = useTranslation();
  usePageTitle(t("aiHub.assistant.title"));

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
                    <Sparkles className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{t("aiHub.assistant.title")}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{t("aiHub.assistant.description")}</p>
                </div>
            </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
            <Tabs defaultValue="assignment" className="w-full space-y-8">
                <div className="sticky top-6 z-40">
                    <div className="rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-card/80 backdrop-blur-2xl p-1.5 shadow-xl">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-transparent">
                            <TabsTrigger 
                                value="assignment" 
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                            >
                                <FileText className="h-4 w-4" />
                                {t("aiHub.assistant.architect")}
                            </TabsTrigger>
                            <TabsTrigger 
                                value="quiz" 
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                            >
                                <BrainCircuit className="h-4 w-4" />
                                {t("aiHub.assistant.generator")}
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <TabsContent value="assignment" className="mt-0">
                        <AIAssignmentHelper />
                    </TabsContent>
                    
                    <TabsContent value="quiz" className="mt-0">
                        <AIQuizGenerator />
                    </TabsContent>
                </motion.div>
            </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
            >
                <Card className="border-primary/10 shadow-lg rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-primary/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-black tracking-tight">{t("aiHub.assistant.capabilities")}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-xs uppercase tracking-widest text-indigo-600">{t("aiHub.assistant.rubrics")}</p>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    {t("aiHub.assistant.rubricsDesc")}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <BrainCircuit className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-xs uppercase tracking-widest text-purple-600">{t("aiHub.assistant.quizzes")}</p>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    {t("aiHub.assistant.quizzesDesc")}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
                                <LayoutDashboard className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-xs uppercase tracking-widest text-green-600">{t("aiHub.assistant.drafts")}</p>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    {t("aiHub.assistant.draftsDesc")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Alert className="rounded-[2rem] border-primary/10 bg-primary/5 p-6">
                    <Info className="h-5 w-5 text-primary" />
                    <div className="ml-2">
                        <AlertTitle className="font-black text-sm uppercase tracking-widest mb-2">{t("aiHub.assistant.proTip")}</AlertTitle>
                        <AlertDescription className="text-sm text-muted-foreground font-medium leading-relaxed">
                            {t("aiHub.assistant.proTipDesc")}
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
