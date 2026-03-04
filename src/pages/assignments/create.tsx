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
import { AIAssignmentHelper } from "@/components/ai-assignment-helper";
import { FileUpload } from "@/components/file-upload";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Sparkles, Paperclip, Loader2, LayoutGrid, HelpCircle } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { Module } from "@/types";
import { useEffect } from "react";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional(),
  fileCldPubId: z.string().optional(),
  moduleId: z.coerce.number().optional().nullable(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

const FieldHelper = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[200px]">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const AssignmentCreate = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const initialModuleId = searchParams.get("moduleId");
  const go = useGo();

  const { query: modulesQuery } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const modules = modulesQuery.data?.data || [];
  const modulesLoading = modulesQuery.isLoading;

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      fileUrl: "",
      fileCldPubId: "",
      moduleId: initialModuleId ? Number(initialModuleId) : null,
    },
    refineCoreProps: {
      resource: "assignments",
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
    watch,
    refineCore: { onFinish, formLoading },
  } = form;

  useEffect(() => {
    if (initialModuleId) {
      setValue("moduleId", Number(initialModuleId));
    }
  }, [initialModuleId, setValue]);

  const onSubmit = (values: FieldValues) => {
    if (!classId) {
      toast.error("Could not create assignment: Class ID is missing.");
      return;
    }
    onFinish({
      ...values,
      classId: Number(classId),
      moduleId: values.moduleId === 0 ? null : values.moduleId,
    });
  };

  const handleUseAIContent = (content: string) => {
    setValue("description", content);
    toast.success("AI content applied to description!");
  };

  const handleFileUpload = (url: string, publicId: string) => {
    setValue("fileUrl", url);
    setValue("fileCldPubId", publicId);
  };

  return (
    <CreateView>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Assignment</CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Helper
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh]">
                  <SheetHeader>
                    <SheetTitle>AI Assignment Helper</SheetTitle>
                    <SheetDescription>
                      Generate a draft and click "Use Content" to fill the form.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto h-full pb-20">
                    <AIAssignmentHelper onUseContent={handleUseAIContent} />
                  </div>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                            <FormLabel>Title</FormLabel>
                            <FieldHelper content="A clear, concise name for the assignment." />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="e.g., Chapter 5 Reading"
                            {...field}
                          />
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
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-2">
                                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                                Curriculum Module (Optional)
                            </FormLabel>
                            <FieldHelper content="Link this assignment to a specific lesson or week in your curriculum." />
                        </div>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value?.toString() || "0"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={modulesLoading ? "Loading modules..." : "Select a module"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">None (Global Assignment)</SelectItem>
                            {modules.map((m: Module) => (
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
                        <div className="flex items-center gap-2">
                            <FormLabel>Description</FormLabel>
                            <FieldHelper content="Detailed instructions, learning objectives, and grading criteria. You can use Markdown here." />
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions for the assignment..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Due Date</FormLabel>
                            <FieldHelper content="The deadline for students to submit their work. Late submissions will be flagged." />
                          </div>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Attachment (Optional)</Label>
                        <FieldHelper content="Upload a PDF, document, or image that students need to complete the assignment." />
                      </div>
                      <FileUpload 
                        label="Upload File"
                        folder="assignments"
                        onUploadSuccess={handleFileUpload}
                      />
                      {watch("fileUrl") && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                          <Paperclip className="h-3 w-3" />
                          File attached successfully
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={formLoading} className="w-full">
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Assignment"
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
              <CardTitle className="text-sm font-medium">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  Curriculum Organization
                </p>
                <p>Assigning this to a module will place it directly in the structured curriculum view for students.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Assistant
                </p>
                <p>Use the AI Helper to quickly draft learning objectives and instructions.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CreateView>
  );
};
