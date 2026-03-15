import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useSearchParams } from "react-router-dom";
import { useGo, useList } from "@refinedev/core";
import { toast } from "sonner";
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
import {
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  LayoutGrid,
  Info,
} from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Module } from "@/types";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

const quizSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("assignments.create.validation.titleRequired")),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    timeLimit: z.coerce.number().min(1).optional(),
    moduleId: z.coerce.number().optional().nullable(),
    questions: z
      .array(
        z.object({
          question: z
            .string()
            .min(1, t("assignments.create.validation.criteriaRequired")),
          options: z
            .array(z.string())
            .length(4, t("assignments.create.validation.criteriaRequired")),
          correctAnswer: z
            .string()
            .min(1, t("assignments.create.validation.criteriaRequired")),
          points: z.coerce.number().min(1).optional().default(1),
        }),
      )
      .min(1, t("assignments.create.validation.criteriaRequired")),
  });

type QuizFormValues = z.infer<ReturnType<typeof quizSchema>>;

const QuizCreate = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const go = useGo();

  const { query } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const modules = query.data?.data || [];
  const modulesLoading = query.isLoading;

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema(t)) as any,
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      timeLimit: 15,
      moduleId: null,
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          points: 1,
        },
      ],
    },
    refineCoreProps: {
      resource: "quizzes",
      action: "create",
      onMutationSuccess: () => {
        if (classId) {
          go({ to: `/classes/show/${classId}`, type: "replace" });
        }
      },
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    refineCore: { onFinish, formLoading },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = (values: QuizFormValues) => {
    if (!classId) {
      toast.error(t("classes.create.identityError"));
      return;
    }
    onFinish({
      ...values,
      classId: Number(classId),
    });
  };

  const handleUseAIQuestions = (questions: any[]) => {
    setValue("questions", questions);
    toast.success(t("assignments.create.toasts.aiContentApplied"));
  };

  return (
    <CreateView>
      <div className="grid gap-6 lg:grid-cols-3 text-start">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
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
                <SheetContent
                  side="bottom"
                  className="h-[80vh] sm:h-[90vh] rounded-t-[3rem]"
                >
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-black uppercase tracking-tight">
                      {t("aiHub.assistant.quizGen.title")}
                    </SheetTitle>
                    <SheetDescription>
                      {t("aiHub.assistant.quizGen.desc")}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto h-full pb-20 custom-scrollbar">
                    <AIQuizHelper onUseQuestions={handleUseAIQuestions} />
                  </div>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form
                  onSubmit={handleSubmit((data) =>
                    onSubmit(data as QuizFormValues),
                  )}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {t("classes.quiz.loading").replace("...", "")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "assignments.create.placeholders.title",
                              )}
                              {...field}
                              className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="moduleId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            {t("assignments.create.curriculumModule")}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-primary font-bold">
                                <SelectValue
                                  placeholder={
                                    modulesLoading
                                      ? t(
                                          "assignments.create.placeholders.loadingClasses",
                                        )
                                      : t(
                                          "assignments.create.placeholders.selectModule",
                                        )
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="0" className="font-bold">
                                {t(
                                  "assignments.create.placeholders.noneGlobal",
                                )}
                              </SelectItem>
                              {modules.map((m: Module) => (
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
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {t("common.description")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t(
                                "classes.form.descriptionPlaceholder",
                              )}
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
                        control={control}
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
                                className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
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

                  <div className="space-y-6 pt-4 border-t border-dashed">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                        {t("classes.quiz.questionsCount", {
                          count: fields.length,
                        }).replace(fields.length.toString() + " ", "")}
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] h-9 gap-2"
                        onClick={() =>
                          append({
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
                      {fields.map((field, index) => (
                        <Card
                          key={field.id}
                          className="border-primary/10 bg-primary/[0.02] rounded-2xl overflow-hidden shadow-sm"
                        >
                          <CardHeader className="flex flex-row items-center justify-between py-3 px-6 border-b bg-primary/5">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-60">
                              #{index + 1}
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive h-8 w-8 rounded-lg hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                            <FormField
                              control={control}
                              name={`questions.${index}.question`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={t(
                                        "aiHub.assistant.quizGen.placeholders.topic",
                                      )}
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
                                  control={control}
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
                                            form.watch(
                                              `questions.${index}.correctAnswer`,
                                            ) === field.value &&
                                            field.value !== ""
                                              ? "default"
                                              : "outline"
                                          }
                                          size="icon"
                                          className={cn(
                                            "shrink-0 rounded-xl h-11 w-11 transition-all",
                                            form.watch(
                                              `questions.${index}.correctAnswer`,
                                            ) === field.value &&
                                              field.value !== ""
                                              ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20"
                                              : "hover:bg-primary/5",
                                          )}
                                          onClick={() =>
                                            setValue(
                                              `questions.${index}.correctAnswer`,
                                              field.value,
                                            )
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

                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
        <div className="hidden lg:block space-y-6">
          <Card className="rounded-[2rem] border-primary/10 bg-primary/5 p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
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
