import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIQuizHelper } from "@/components/ai-quiz-helper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, LayoutGrid, Info } from "lucide-react";
import { Module } from "@/types";
import { useTranslation } from "react-i18next";
import { useQuizCreate, QuizFormValues } from "../hooks/use-quiz-create";
import { QuizQuestionsForm } from "../components/quiz-questions-form";

const QuizCreate = () => {
  const { t } = useTranslation();
  const { form, questions, data, actions } = useQuizCreate();

  return (
    <CreateView>
      <div className="grid gap-6 lg:grid-cols-3 text-start">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-4xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 border-b bg-primary/5">
              <CardTitle className="text-xl font-black uppercase tracking-widest">
                {t("classes.show.tabs.quizzes")}
              </CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl border-ai-primary/20 text-ai-primary font-bold"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t("buttons.aiAssist")}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh] rounded-t-[3rem]">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-black uppercase tracking-tight">
                      {t("aiHub.assistant.quizGen.title")}
                    </SheetTitle>
                    <SheetDescription>{t("aiHub.assistant.quizGen.desc")}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto h-full pb-20 custom-scrollbar">
                    <AIQuizHelper onUseQuestions={actions.handleUseAIQuestions} />
                  </div>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-8 text-start">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(actions.onSubmit as any)} className="space-y-8">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {t("classes.quiz.loading").replace("...", "")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("assignments.create.placeholders.title")}
                              {...field}
                              className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="moduleId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            {t("assignments.create.curriculumModule")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-primary font-bold">
                                <SelectValue
                                  placeholder={t("assignments.create.placeholders.selectModule")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="0" className="font-bold">
                                {t("assignments.create.placeholders.noneGlobal")}
                              </SelectItem>
                              {data.modules.map((m: Module) => (
                                <SelectItem
                                  key={m.id}
                                  value={m.id.toString()}
                                  className="font-bold"
                                >
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {t("common.description")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("classes.form.descriptionPlaceholder")}
                              {...field}
                              className="min-h-[100px] rounded-xl bg-muted/20 border-none focus-visible:ring-primary p-4 font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {t("assignments.create.submissionDeadline")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="h-12 rounded-xl bg-muted/20 border-none font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {t("classes.quiz.minsUnit")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold text-center"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <QuizQuestionsForm form={form} questions={questions} />

                  <Button
                    type="submit"
                    disabled={form.refineCore.formLoading}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {form.refineCore.formLoading ? (
                      <>
                        <Loader2 className="me-2 h-5 w-5 animate-spin" />
                        {t("buttons.publishing")}
                      </>
                    ) : (
                      t("buttons.publishAssignment")
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="hidden lg:block space-y-6 text-start">
          <Card className="rounded-4xl border-primary/10 bg-primary/5 p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute -end-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="h-32 w-32" />
            </div>
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                {t("pricing.whatsIncluded")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-muted-foreground space-y-6">
              <div className="space-y-2">
                <p className="font-black text-[10px] uppercase tracking-widest text-foreground flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                  {t("aiHub.assistant.capabilities")}
                </p>
                <p className="text-xs font-medium leading-relaxed">
                  {t("aiHub.assistant.quizzesDesc")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-black text-[10px] uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {t("aiHub.assistant.title")}
                </p>
                <p className="text-xs font-medium leading-relaxed">
                  {t("aiHub.assistant.draftsDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CreateView>
  );
};

export default QuizCreate;
