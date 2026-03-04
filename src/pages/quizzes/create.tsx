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
import { Sparkles, Loader2, Plus, Trash2, CheckCircle2, LayoutGrid } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Module } from "@/types";

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  timeLimit: z.coerce.number().min(1).optional(),
  moduleId: z.coerce.number().optional().nullable(),
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question text is required"),
      options: z.array(z.string()).length(4, "Exactly 4 options are required"),
      correctAnswer: z.string().min(1, "Correct answer is required"),
      points: z.coerce.number().min(1).optional().default(1),
    })
  ).min(1, "At least one question is required"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

const QuizCreate = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const go = useGo();

  // Fetch modules for this class
  const { data: modulesData, isLoading: modulesLoading } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const modules = modulesData?.data || [];

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema) as any,
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
      toast.error("Could not create quiz: Class ID is missing.");
      return;
    }
    onFinish({
      ...values,
      classId: Number(classId),
    });
  };

  const handleUseAIQuestions = (questions: any[]) => {
    // Replace existing questions with AI ones
    setValue("questions", questions);
    toast.success("AI questions applied to quiz!");
  };

  return (
    <CreateView>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Quiz</CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Quiz Helper
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh]">
                  <SheetHeader>
                    <SheetTitle>AI Quiz Helper</SheetTitle>
                    <SheetDescription>
                      Generate questions and click "Use All Questions" to fill the form.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto h-full pb-20">
                    <AIQuizHelper onUseQuestions={handleUseAIQuestions} />
                  </div>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSubmit((data) => onSubmit(data as QuizFormValues))} className="space-y-8">
                  <div className="space-y-4">
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Midterm Quiz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="moduleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                            Curriculum Module (Optional)
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={modulesLoading ? "Loading modules..." : "Select a module"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">None (Global Quiz)</SelectItem>
                              {modules.map((m) => (
                                <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
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
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Instructions for the quiz..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (Minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Questions</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({
                            question: "",
                            options: ["", "", "", ""],
                            correctAnswer: "",
                            points: 1,
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <Card key={field.id} className="border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between py-3">
                          <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={control}
                            name={`questions.${index}.question`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Enter question text..." {...field} />
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
                                        <Input placeholder={`Option ${optIdx + 1}`} {...field} />
                                      </FormControl>
                                      <Button
                                        type="button"
                                        variant={
                                          form.watch(`questions.${index}.correctAnswer`) === field.value && field.value !== ""
                                            ? "default"
                                            : "outline"
                                        }
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() => setValue(`questions.${index}.correctAnswer`, field.value)}
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

                  <Button type="submit" disabled={formLoading} className="w-full">
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Quiz"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="hidden lg:block">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quiz Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  Curriculum Organization
                </p>
                <p>Assigning this quiz to a module helps students find it within their structured learning path.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Generation
                </p>
                <p>Use the AI Quiz Helper to generate a full set of questions in seconds. You can edit them after applying.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CreateView>
  );
};

export default QuizCreate;
