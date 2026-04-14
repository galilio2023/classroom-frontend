import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelect, useList, useGetIdentity, HttpError, BaseRecord } from "@refinedev/core";
import { useFieldArray } from "react-hook-form";
import { useState } from "react";
import { classCreateFormSchema } from "@/schemas/class";
import { Subject, User, ClassStatus, AcademicTerm } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import z from "zod";

type ClassFormValues = z.infer<typeof classCreateFormSchema>;

export const useClassForm = (action: "create" | "edit", id?: string) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const [isCreatingNewSubject, setIsCreatingNewSubject] = useState(false);

  const formReturn = useForm<BaseRecord, HttpError, ClassFormValues>({
    resolver: zodResolver(classCreateFormSchema) as any,
    refineCoreProps: {
      resource: "classes",
      action,
      id,
      redirect: "list",
      onMutationSuccess: (data) => {
        if (action === "edit") {
          const newVersion = (data as any)?.data?.version;
          if (newVersion) {
            formReturn.setValue("version", newVersion);
          }
        }
      },
    },
    defaultValues: {
      name: "",
      description: "",
      subjectId: undefined,
      termId: undefined,
      capacity: 30,
      status: ClassStatus.ACTIVE,
      schedules: [],
      color: "#3b82f6",
      newSubjectName: "",
      version: 1,
    },
  });

  const {
    refineCore: { onFinish, formLoading },
    handleSubmit,
    setValue,
    control,
  } = formReturn;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  const { options: subjectOptions, query: subjectsQuery } = useSelect<Subject>({
    resource: "subjects",
    optionLabel: "name",
    optionValue: "id",
  });

  const { query: termsQuery } = useList<AcademicTerm>({
    resource: "academic-terms",
    pagination: { pageSize: 100 },
    filters: [
      {
        field: "status",
        operator: "in",
        value: ["active", "upcoming"],
      },
    ],
  });

  const terms = termsQuery.data?.data ?? [];
  const termsLoading = termsQuery.isLoading;

  const handleOnSubmit = async (values: ClassFormValues) => {
    if (!identity?.id) {
      toast.error(t("classes.create.identityError"));
      return;
    }

    const payload = { ...values, teacherId: identity.id };
    if (isCreatingNewSubject) {
      delete payload.subjectId;
    } else {
      delete payload.newSubjectName;
    }

    await onFinish(payload as any);
  };

  return {
    form: formReturn,
    onSubmit: handleSubmit(handleOnSubmit),
    subjectOptions,
    subjectsLoading: subjectsQuery.isLoading,
    terms,
    termsLoading,
    fields,
    append,
    remove,
    formLoading,
    isCreatingNewSubject,
    setIsCreatingNewSubject,
    setValue,
  };
};
