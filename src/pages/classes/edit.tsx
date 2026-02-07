import { EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelect } from "@refinedev/core";
import { useParams } from "react-router-dom"; // Corrected import
import { useFieldArray } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { classFormSchema } from "@/schemas/class";
import { Subject, ClassStatus } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClassForm } from "./form";

const ClassesEdit = () => {
  const { id } = useParams();

  const { 
    refineCore: { onFinish, formLoading, queryResult }, 
    ...form 
  } = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      subjectId: "",
      capacity: 0,
      status: ClassStatus.ACTIVE,
      schedules: [],
    },
    refineCoreProps: {
      resource: "classes",
      action: "edit",
      redirect: "list",
      id: id,
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

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <EditViewHeader />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              <ClassForm 
                form={form}
                subjectOptions={subjectOptions}
                fields={fields}
                append={append}
                remove={remove}
                formLoading={formLoading}
                isEdit={true}
              />
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Info className="h-5 w-5 text-yellow-500" />
                Editing Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Changes to the schedule will update immediately for all enrolled students.
              </p>
            </CardContent>
          </Card>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Invite Code</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1 font-mono">
              {queryResult?.data?.data.inviteCode}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ClassesEdit;
