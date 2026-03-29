import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Props {
  form: any;
  questions: any;
}

export const QuizQuestionsForm = ({ form, questions }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pt-4 border-t border-dashed">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-primary">
          {t("classes.quiz.questionsCount", {
            count: questions.fields.length,
          }).replace(questions.fields.length.toString() + " ", "")}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] h-9 gap-2"
          onClick={() =>
            questions.append({
              question: "",
              options: ["", "", "", ""],
              correctAnswer: "",
              points: 1,
            })
          }
        >
          <Plus className="h-3.5 w-3.5" />
          {t("buttons.addTask")}
        </Button>
      </div>

      <div className="space-y-4">
        {questions.fields.map((field: any, index: number) => (
          <Card
            key={field.id}
            className="border-primary/10 bg-primary/2 rounded-2xl overflow-hidden shadow-sm text-start"
          >
            <CardHeader className="flex flex-row items-center justify-between py-3 px-6 border-b bg-primary/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-60">
                #{index + 1}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => questions.remove(index)}
                className="text-destructive h-8 w-8 rounded-lg hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name={`questions.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={t("aiHub.assistant.quizGen.placeholders.topic")}
                        {...field}
                        className="h-12 rounded-xl bg-background border-none shadow-inner focus-visible:ring-primary font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((optIdx) => (
                  <FormField
                    key={optIdx}
                    control={form.control}
                    name={`questions.${index}.options.${optIdx}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              placeholder={`${t("aiHub.assistant.quizGen.format")} ${optIdx + 1}`}
                              {...field}
                              className="h-11 rounded-xl bg-background border-none shadow-sm focus-visible:ring-primary font-medium"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant={
                              form.watch(`questions.${index}.correctAnswer`) === field.value &&
                              field.value !== ""
                                ? "default"
                                : "outline"
                            }
                            size="icon"
                            className={cn(
                              "shrink-0 rounded-xl h-11 w-11 transition-all",
                              form.watch(`questions.${index}.correctAnswer`) === field.value &&
                                field.value !== ""
                                ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20"
                                : "hover:bg-primary/5"
                            )}
                            onClick={() =>
                              form.setValue(`questions.${index}.correctAnswer`, field.value)
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
