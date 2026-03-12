import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { BrainCircuit, Sparkles, Save, BarChart, ListChecks } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizGeneratorFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  count: number[];
  setCount: (count: number[]) => void;
  difficulty?: string;
  setDifficulty?: (difficulty: string) => void;
  type?: string;
  setType?: (type: string) => void;
  handleGenerate: () => void;
  handleSaveAsAssignment: () => void;
  isLoading: boolean;
  isSaving: boolean;
  hasQuiz: boolean;
  classId?: string;
}

export const QuizGeneratorForm: React.FC<QuizGeneratorFormProps> = ({
  topic,
  setTopic,
  count,
  setCount,
  difficulty = "medium",
  setDifficulty,
  type = "multiple_choice",
  setType,
  handleGenerate,
  handleSaveAsAssignment,
  isLoading,
  isSaving,
  hasQuiz,
  classId,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <AICard
      title={t("aiHub.assistant.quizGen.title")}
      description={t("aiHub.assistant.quizGen.desc")}
      icon={BrainCircuit}
      className="lg:col-span-1"
      footer={
        <div className="flex flex-col gap-3 w-full">
          <LoadingButton
            className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
            onClick={handleGenerate}
            isLoading={isLoading}
            loadingText={t("aiHub.assistant.quizGen.generating")}
            icon={<Sparkles className="h-4 w-4" />}
          >
            {t("aiHub.assistant.quizGen.generate")}
          </LoadingButton>
          {hasQuiz && classId && (
            <LoadingButton
              variant="outline"
              className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={handleSaveAsAssignment}
              isLoading={isSaving}
              loadingText={t("aiHub.assistant.quizGen.saving")}
              icon={<Save className="h-4 w-4" />}
            >
              {t("aiHub.assistant.quizGen.saveAsAssignment")}
            </LoadingButton>
          )}
        </div>
      }
    >
      <div className="space-y-6 text-start">
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("aiHub.assistant.quizGen.topic")}</Label>
          <Input
            id="topic"
            placeholder={t("aiHub.assistant.quizGen.placeholders.topic")}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("aiHub.assistant.quizGen.difficulty")}</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold">
                        <div className="flex items-center gap-2">
                            <BarChart className="h-4 w-4 text-primary" />
                            <SelectValue placeholder={t("aiHub.assistant.quizGen.difficulty")} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy" className="font-bold">{t("aiHub.assistant.quizGen.difficulties.easy")}</SelectItem>
                        <SelectItem value="medium" className="font-bold">{t("aiHub.assistant.quizGen.difficulties.medium")}</SelectItem>
                        <SelectItem value="hard" className="font-bold">{t("aiHub.assistant.quizGen.difficulties.hard")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("aiHub.assistant.quizGen.format")}</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type" className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold">
                        <div className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-primary" />
                            <SelectValue placeholder={t("aiHub.assistant.quizGen.format")} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="multiple_choice" className="font-bold">{t("aiHub.assistant.quizGen.formats.multiple_choice")}</SelectItem>
                        <SelectItem value="true_false" className="font-bold">{t("aiHub.assistant.quizGen.formats.true_false")}</SelectItem>
                        <SelectItem value="mixed" className="font-bold">{t("aiHub.assistant.quizGen.formats.mixed")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between px-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("aiHub.assistant.quizGen.questions")}</Label>
            <span className="text-sm font-black text-primary">{new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(count[0])}</span>
          </div>
          <Slider
            value={count}
            onValueChange={setCount}
            max={15}
            min={1}
            step={1}
            className="py-2"
          />
        </div>
      </div>
    </AICard>
  );
};
