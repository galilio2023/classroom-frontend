import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "react-router-dom";
import { useGo, useList } from "@refinedev/core";
import { toast } from "sonner";
import { useFieldArray } from "react-hook-form";
import { Module } from "@/types";
import { useTranslation } from "react-i18next";

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
          question: z.string().min(1, t("assignments.create.validation.criteriaRequired")),
          options: z.array(z.string()).length(4, t("assignments.create.validation.criteriaRequired")),
          correctAnswer: z.string().min(1, t("assignments.create.validation.criteriaRequired")),
          points: z.coerce.number().min(1).optional().default(1),
        }),
      )
      .min(1, t("assignments.create.validation.criteriaRequired")),
  });

export type QuizFormValues = z.infer<ReturnType<typeof quizSchema>>;

export const useQuizCreate = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const go = useGo();

  const { query: modulesQuery } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema(t)) as any,
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      timeLimit: 15,
      moduleId: null,
      questions: [
        { question: "", options: ["", "", "", ""], correctAnswer: "", points: 1 },
      ],
    },
    refineCoreProps: {
      resource: "quizzes",
      action: "create",
      onMutationSuccess: () => {
        if (classId) go({ to: `/classes/show/${classId}`, type: "replace" });
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const onSubmit = (values: QuizFormValues) => {
    if (!classId) {
      toast.error(t("classes.create.identityError"));
      return;
    }
    form.refineCore.onFinish({
      ...values,
      classId: Number(classId),
    });
  };

  const handleUseAIQuestions = (questions: any[]) => {
    form.setValue("questions", questions);
    toast.success(t("assignments.create.toasts.aiContentApplied"));
  };

  return {
    form,
    questions: { fields, append, remove },
    data: {
      modules: modulesQuery.data?.data || [],
      isLoading: modulesQuery.isLoading,
      classId
    },
    actions: { onSubmit, handleUseAIQuestions }
  };
};
