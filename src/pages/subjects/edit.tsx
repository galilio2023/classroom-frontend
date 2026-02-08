import { EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelect } from "@refinedev/core";
import { Department } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Code2,
  Building2,
  FileText,
  Lightbulb,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the validation schema using z.coerce for automatic type conversion
const formSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be less than 50 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
  departmentId: z.coerce.number().positive("Department is required"),
});

const SubjectsEdit = () => {
  const {
    refineCore: { onFinish, formLoading, query },
    ...form
  } = useForm({
    resolver: zodResolver(formSchema),
    refineCoreProps: {
      resource: "subjects",
      action: "edit",
      redirect: "list",
    },
  });

  const { options: departmentOptions } = useSelect<Department>({
    resource: "departments",
    optionLabel: "name",
    optionValue: "id",
    defaultValue: query?.data?.data.departmentId,
  });

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <EditViewHeader />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Main Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Edit Subject
                  </CardTitle>
                  <CardDescription>
                    Update the details for the subject "
                    {query?.data?.data.name}".
                  </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code Field */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-muted-foreground" />
                            Subject Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. CS101"
                              {...field}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Subject Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Intro to Programming"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Department Dropdown */}
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          Department
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={String(field.value ?? "")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departmentOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The academic department this subject belongs to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the subject..."
                            className="resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end pt-6 pb-6 bg-muted/5">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={formLoading}
                    className="min-w-[150px]"
                  >
                    {formLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        {/* Right Column: Sidebar / Help */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p>
                  <strong>Consistent Codes:</strong> Use a standard format like
                  "DEPT-101" to make searching easier.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p>
                  <strong>Clear Names:</strong> Avoid abbreviations.
                  "Introduction to Psychology" is better than "Intro to Psych".
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Editing Mode</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              Changes made here will overwrite the existing subject data. Be
              sure to save your work.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default SubjectsEdit;
