import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { LoadingButton } from "../ui/loading-button";
import { AICard } from "./ai-card";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizHelperFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  count: number;
  setCount: (count: number) => void;
  handleGenerate: () => void;
  isLoading: boolean;
}

export const QuizHelperForm: React.FC<QuizHelperFormProps> = ({
  topic,
  setTopic,
  count,
  setCount,
  handleGenerate,
  isLoading,
}) => {
  const { t } = useTranslation();
  return (
    <AICard
      title={t("aiHub.assistant.generator")}
      description={t("aiHub.assistant.quizzesDesc")}
      footer={
        <LoadingButton
          className="w-full"
          onClick={handleGenerate}
          isLoading={isLoading}
          loadingText={t("aiHub.assistant.quizGen.generating")}
          icon={<Sparkles className="h-4 w-4" />}
        >
          {t("aiHub.assistant.quizGen.generate")}
        </LoadingButton>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">{t("aiHub.assistant.quizGen.topic")}</Label>
          <Input
            id="topic"
            placeholder={t("aiHub.assistant.quizGen.placeholders.topic")}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="count">{t("aiHub.assistant.quizGen.questions")}</Label>
          <Input
            id="count"
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
      </div>
    </AICard>
  );
};
