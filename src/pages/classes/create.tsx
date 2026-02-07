import { CreateViewHeader } from "@/components/refine-ui/views/create-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelect, useGetIdentity } from "@refinedev/core";
import { useFieldArray } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
// Import the correct schema
import { classCreateFormSchema } from "@/schemas/class"; 
import { ClassStatus, Subject, User } from "@/types";
import { ClassForm } from "./form";

const ClassesCreate = () => {
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();

  const { 
    refineCore: { onFinish, formLoading }, 
    ...form 
  } = useForm({
    // Use the new schema for validation
    resolver: zodResolver(classCreateFormSchema), 
    defaultValues: {
      name: "",
      subjectId: "",
      capacity: 50,
      status: ClassStatus.ACTIVE,
      schedules: [{ day: "Mon", startTime: "09:00", endTime: "10:30" }],
    },
    refineCoreProps: {
      resource: "classes",
      redirect: "list",
    },
  });

  const handleFormSubmit = async (values: any) => {
    if (!identity?.id) {
      console.error("Cannot create class: Teacher ID is missing.");
      return;
    }
    const formDataWithTeacher = {
      ...values,
      teacherId: identity.id,
    };
    await onFinish(formDataWithTeacher);
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const { options: subjectOptions, isLoading: areSubjectsLoading } = useSelect<Subject>({
    resource: "subjects",
    optionLabel: "name",
    optionValue: "id",
  });

  const isFormLoading = formLoading || isIdentityLoading || areSubjectsLoading;

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <CreateViewHeader />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <ClassForm 
                form={form}
                subjectOptions={subjectOptions}
                fields={fields}
                append={append}
                remove={remove}
                formLoading={isFormLoading}
              />
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Teacher Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                You will be automatically assigned as the teacher for this class.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClassesCreate;
