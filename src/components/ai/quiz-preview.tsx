import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HelpCircle } from "lucide-react";
import { QuizQuestionItem } from "./quiz-question-item";
import { QuizEmptyState } from "./quiz-empty-state";
import { useTranslation } from "react-i18next";

interface QuizPreviewProps {
  quiz: any[];
}

export const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz }) => {
  const { t } = useTranslation();
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          {t("aiHub.assistant.quizGen.title")}
        </CardTitle>
        <CardDescription>{t("aiHub.assistant.quizGen.desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {quiz.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {quiz.map((q, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-start">
                  <span className="font-medium">
                    Q{index + 1}: {q.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <QuizQuestionItem question={q} index={index} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <QuizEmptyState />
        )}
      </CardContent>
    </Card>
  );
};
