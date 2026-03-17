import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { Sparkles, GraduationCap, MessageSquare, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AssignmentGeneratorFormProps {
  subject: string;
  setSubject: (subject: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  tone?: string;
  setTone?: (tone: string) => void;
  objectives?: string;
  setObjectives?: (objectives: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
}

export const AssignmentGeneratorForm: React.FC<
  AssignmentGeneratorFormProps
> = ({
  subject,
  setSubject,
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  tone = "academic",
  setTone,
  objectives = "",
  setObjectives,
  handleGenerate,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <AICard
      title={t("aiHub.assistant.helper.title")}
      description={t("aiHub.assistant.helper.desc")}
      className="overflow-hidden"
      footer={
        <LoadingButton
          className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
          onClick={handleGenerate}
          isLoading={isLoading}
          loadingText={t("aiHub.assistant.helper.generating")}
          icon={<Sparkles className="h-4 w-4" />}
        >
          {t("aiHub.assistant.helper.generate")}
        </LoadingButton>
      }
    >
      <div className="space-y-6 text-start">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 min-w-0">
            <Label
              htmlFor="subject"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
            >
              {t("aiHub.assistant.helper.subject")}
            </Label>
            <Input
              id="subject"
              placeholder={t("aiHub.assistant.helper.placeholders.subject")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-11 w-full rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label
              htmlFor="difficulty"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
            >
              {t("aiHub.assistant.helper.level")}
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger
                id="difficulty"
                className="h-11 w-full rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate block">
                    <SelectValue
                      placeholder={t("aiHub.assistant.helper.level")}
                    />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner" className="font-bold">
                  {t("aiHub.assistant.helper.levels.beginner")}
                </SelectItem>
                <SelectItem value="intermediate" className="font-bold">
                  {t("aiHub.assistant.helper.levels.intermediate")}
                </SelectItem>
                <SelectItem value="advanced" className="font-bold">
                  {t("aiHub.assistant.helper.levels.advanced")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="topic"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
          >
            {t("aiHub.assistant.helper.topic")}
          </Label>
          <Input
            id="topic"
            placeholder={t("aiHub.assistant.helper.placeholders.topic")}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-11 w-full rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
          />
        </div>

        <div className="space-y-2 min-w-0">
          <Label
            htmlFor="tone"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
          >
            {t("aiHub.assistant.helper.tone")}
          </Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger
              id="tone"
              className="h-11 w-full rounded-xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate block">
                  <SelectValue placeholder={t("aiHub.assistant.helper.tone")} />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic" className="font-bold">
                {t("aiHub.assistant.helper.tones.academic")}
              </SelectItem>
              <SelectItem value="creative" className="font-bold">
                {t("aiHub.assistant.helper.tones.creative")}
              </SelectItem>
              <SelectItem value="practical" className="font-bold">
                {t("aiHub.assistant.helper.tones.practical")}
              </SelectItem>
              <SelectItem value="strict" className="font-bold">
                {t("aiHub.assistant.helper.tones.strict")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="objectives"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1"
          >
            <Target className="h-3.5 w-3.5 text-primary shrink-0" />
            {t("aiHub.assistant.helper.objectives")}
          </Label>
          <Textarea
            id="objectives"
            placeholder={t("aiHub.assistant.helper.placeholders.objectives")}
            value={objectives}
            onChange={(e) => setObjectives?.(e.target.value)}
            className="resize-none min-h-24 w-full rounded-3xl bg-muted/30 border-none focus-visible:ring-primary p-5 text-sm font-medium leading-relaxed"
          />
        </div>
      </div>
    </AICard>
  );
};
