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
import { useGo } from "@refinedev/core";
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
import { Sparkles, Paperclip, Loader2 } from "lucide-react";
import { FieldValues } from "react-hook-form";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional(),
  fileCldPubId: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const AssignmentCreate = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const go = useGo();

  // MANDATORY: Use Refine v5 useForm pattern with refineCoreProps
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      fileUrl: "",
      fileCldPubId: "",
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

  const onSubmit = (values: FieldValues) => {
    if (!classId) {
      toast.error("Could not create assignment: Class ID is missing.");
      return;
    }
    onFinish({
      ...values,
      classId: Number(classId),
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
                        <FormLabel>Title</FormLabel>
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
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
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FileUpload 
                        label="Attachment (Optional)" 
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
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Assistant
                </p>
                <p>Use the AI Helper to quickly draft learning objectives and instructions.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  Attachments
                </p>
                <p>You can now upload PDFs, images, or documents as reference materials for your students.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CreateView>
  );
};
