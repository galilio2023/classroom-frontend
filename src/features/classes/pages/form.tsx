import {
  UseFormReturn,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { useList } from "@refinedev/core";
import { AcademicTerm } from "@/types";
import { BasicDetailsSection } from "../components/BasicDetailsSection";
import { MonetizationSection } from "../components/MonetizationSection";
import { ScheduleSection } from "../components/ScheduleSection";
import { FormActions } from "../components/FormActions";

interface ClassFormProps {
  form: UseFormReturn<any>;
  subjectOptions: { value: string | number; label: string }[];
  fields: FieldArrayWithId<any, "schedules", "id">[];
  append: UseFieldArrayAppend<any, "schedules">;
  remove: UseFieldArrayRemove;
  formLoading: boolean;
  isEdit?: boolean;
  isCreatingNewSubject?: boolean;
  setIsCreatingNewSubject?: (value: boolean) => void;
  subjectsLoading?: boolean;
}

export const ClassForm = ({
  form,
  subjectOptions,
  fields,
  append,
  remove,
  formLoading,
  isEdit = false,
  isCreatingNewSubject = false,
  setIsCreatingNewSubject,
  subjectsLoading = false,
}: ClassFormProps) => {
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

  const termsLoading = termsQuery.isLoading;
  const terms = termsQuery.data?.data || [];

  return (
    <div className="space-y-10">
      <BasicDetailsSection
        form={form}
        subjectOptions={subjectOptions}
        terms={terms}
        termsLoading={termsLoading}
        isEdit={isEdit}
        isCreatingNewSubject={isCreatingNewSubject}
        setIsCreatingNewSubject={setIsCreatingNewSubject}
        subjectsLoading={subjectsLoading}
      />

      <MonetizationSection form={form} />

      <ScheduleSection form={form} fields={fields} append={append} remove={remove} />

      <FormActions formLoading={formLoading} isEdit={isEdit} />
    </div>
  );
};
