import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { useBack, useList, useGetIdentity, HttpError, BaseRecord } from "@refinedev/core";
import { Loader2, Check } from "lucide-react";
import { classCreateFormSchema } from "@/schemas/class";
import { Subject, User, ClassStatus } from "@/types";
import { toast } from "sonner";
import z from "zod";
import { cn } from "@/lib/utils";

// Define a type alias for the form values based on the Zod schema
type ClassCreateFormValues = z.infer<typeof classCreateFormSchema>;

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#71717a", // Zinc
];

const ClassesCreate = () => {
  const back = useBack();
  const { data: identity } = useGetIdentity<User>();

  // Explicitly type the useForm hook with all necessary generic arguments
  const form = useForm<BaseRecord, HttpError, ClassCreateFormValues>({
    resolver: zodResolver(classCreateFormSchema) as any,
    refineCoreProps: {
      resource: "classes",
      action: "create",
      redirect: "list",
    },
    defaultValues: {
      name: "",
      description: "",
      subjectId: undefined,
      capacity: 30,
      status: ClassStatus.ACTIVE,
      schedules: [],
      color: PRESET_COLORS[0],
    },
  });

  const {
    refineCore: { onFinish },
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  // The 'values' parameter now correctly matches the type expected by handleSubmit
  const onSubmit = async (values: ClassCreateFormValues) => {
    if (!identity?.id) {
      toast.error("Cannot create class: User identity not found.");
      return;
    }
    await onFinish({
      ...values,
      teacherId: identity.id,
    } as any);
  };

  // Correctly use useList based on the official documentation
  const { result: subjectsResult, query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsResult?.data ?? [];
  const subjectsLoading = subjectsQuery.isLoading;

  return (
    <CreateView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Create a Class</h1>
      <div className="intro-row">
        <p>Provide the required information below to add a class.</p>
        <Button onClick={() => back()}>Go Back</Button>
      </div>
      <Separator />
      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader>
            <CardTitle className="text-2xl pb-0 font-bold">
              Class Details
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-7">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Introduction to Biology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={subjectsLoading}
                        >
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.name}
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
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Theme Color</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={cn(
                                "h-8 w-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                                field.value === color ? "border-foreground scale-110" : "border-transparent"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                            >
                              {field.value === color && <Check className="h-4 w-4 text-white" />}
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A brief description of the class." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex gap-1 items-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Class"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default ClassesCreate;
