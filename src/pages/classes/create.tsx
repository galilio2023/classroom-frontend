import { CreateViewHeader } from "@/components/refine-ui/views/create-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelect } from "@refinedev/core";
import { useFieldArray } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { classFormSchema } from "@/schemas/class";
import { ClassStatus, Subject, User, UserRole } from "@/types";
import { ClassForm } from "./form";

const ClassesCreate = () => {
  const { 
    refineCore: { onFinish, formLoading }, 
    ...form 
  } = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      capacity: 50,
      status: ClassStatus.ACTIVE,
      schedules: [{ day: "Mon", startTime: "09:00", endTime: "10:30" }],
    },
    refineCoreProps: {
      resource: "classes",
      redirect: "list",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const { options: subjectOptions } = useSelect<Subject>({
    resource: "subjects",
    optionLabel: "name",
    optionValue: "id",
  });

  const { options: teacherOptions } = useSelect<User>({
    resource: "users",
    optionLabel: "name",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: UserRole.TEACHER,
      },
    ],
  });

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <CreateViewHeader />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              <ClassForm 
                form={form}
                subjectOptions={subjectOptions}
                teacherOptions={teacherOptions}
                fields={fields}
                append={append}
                remove={remove}
                formLoading={formLoading}
              />
            </form>
          </Form>
        </div>

        {/* Right Column: Sidebar */}
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
                Only users with the <strong>Teacher</strong> role will appear in the dropdown.
              </p>
              <p>
                If you don't see a teacher, go to the Users page and ensure their role is set correctly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClassesCreate;
