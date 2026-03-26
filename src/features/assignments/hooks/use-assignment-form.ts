import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useLocation } from "react-router-dom";
import { useGo, useList } from "@refinedev/core";
import { toast } from "sonner";
import { useFieldArray } from "react-hook-form";
import { Module, Class } from "@/types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const createAssignmentSchema = (t: TFunction) => z.object({
  title: z.string().min(1, t("assignments.create.validation.titleRequired")),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional(),
  fileCldPubId: z.string().optional(),
  moduleId: z.coerce.number().optional().nullable(),
  classId: z.coerce.number().min(1, t("assignments.create.validation.classRequired")),
  hasPeerReview: z.boolean().default(false),
  isGroupAssignment: z.boolean().default(false),
  peerReviewWeight: z.coerce.number().min(0).max(100).default(20),
  rubric: z.array(z.object({
    criteria: z.string().min(1, t("assignments.create.validation.criteriaRequired")),
    maxPoints: z.coerce.number().min(1, t("assignments.create.validation.pointsRequired")),
  })).default([]),
});

export type AssignmentFormValues = z.infer<ReturnType<typeof createAssignmentSchema>>;

interface LocationState {
  pendingContent?: string;
}

export const useAssignmentForm = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlClassId = searchParams.get("classId");
  const initialModuleId = searchParams.get("moduleId");
  const go = useGo();
  const [showAI, setShowAI] = useState(false);
  const isAr = i18n.language === 'ar';

  const { query: classesQuery } = useList<Class>({
    resource: "classes",
    pagination: { mode: "off" },
  });

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema(t)) as any,
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      fileUrl: "",
      fileCldPubId: "",
      moduleId: initialModuleId ? Number(initialModuleId) : null,
      classId: urlClassId ? Number(urlClassId) : undefined as unknown as number,
      hasPeerReview: false,
      isGroupAssignment: false,
      peerReviewWeight: 20,
      rubric: [{ criteria: "Accuracy", maxPoints: 10 }, { criteria: "Clarity", maxPoints: 10 }],
    },
    warnWhenUnsavedChanges: true,
    refineCoreProps: {
      resource: "assignments",
      action: "create",
      onMutationSuccess: () => {
        const targetClassId = form.getValues("classId");
        localStorage.removeItem("draft:assignment:new"); // Clear draft on success
        go({ to: `/classes/show/${targetClassId}`, type: "replace" });
      },
    },
  });

  // 🛡️ AUTO-DRAFT PERSISTENCE: Save form state to localStorage
  const watchedValues = form.watch();
  useEffect(() => {
      const draft = {
          title: watchedValues.title,
          description: watchedValues.description,
          classId: watchedValues.classId,
          moduleId: watchedValues.moduleId
      };
      if (draft.title || draft.description) {
          localStorage.setItem("draft:assignment:new", JSON.stringify(draft));
      }
  }, [watchedValues.title, watchedValues.description, watchedValues.classId, watchedValues.moduleId]);

  // 🚀 DRAFT RECOVERY: Restore state on mount
  useEffect(() => {
      const savedDraft = localStorage.getItem("draft:assignment:new");
      if (savedDraft) {
          try {
              const parsed = JSON.parse(savedDraft);
              if (parsed.title && !form.getValues("title")) form.setValue("title", parsed.title);
              if (parsed.description && !form.getValues("description")) form.setValue("description", parsed.description);
              if (parsed.classId && !form.getValues("classId")) form.setValue("classId", parsed.classId);
          } catch (e) {
              console.error("Draft recovery failed", e);
          }
      }
  }, [form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rubric",
  });

  const selectedClassId = form.watch("classId");

  const { query: modulesQuery } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: selectedClassId }],
    queryOptions: { enabled: !!selectedClassId },
  });

  useEffect(() => {
    if (initialModuleId) form.setValue("moduleId", Number(initialModuleId));
    
    const stateContent = (location.state as LocationState)?.pendingContent;
    const sessionContent = sessionStorage.getItem("pending_ai_assignment");
    const pendingContent = stateContent || sessionContent;

    if (pendingContent) {
        form.setValue("description", pendingContent);
        if (sessionContent) sessionStorage.removeItem("pending_ai_assignment");
        toast.info(t("assignments.create.toasts.aiDraftApplied"));
        setShowAI(false);
    }
  }, [initialModuleId, location.state, t, form]);

  const handleUseAIContent = (content: string) => {
    form.setValue("description", content);
    toast.success(t("assignments.create.toasts.aiContentApplied"));
    document.getElementById("description")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (url: string, publicId: string) => {
    form.setValue("fileUrl", url);
    form.setValue("fileCldPubId", publicId);
  };

  return {
    form,
    rubric: { fields, append, remove },
    data: {
      classes: classesQuery.data?.data || [],
      modules: modulesQuery.data?.data || [],
      isLoading: classesQuery.isLoading || modulesQuery.isLoading,
      urlClassId,
      isAr,
      showAI
    },
    state: { setShowAI },
    actions: { handleUseAIContent, handleFileUpload }
  };
};
