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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Submission } from "@/types";
import { FileUpload } from "@/components/file-upload";
import { Paperclip, Loader2 } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { useGo, useInvalidate } from "@refinedev/core";

const submissionSchema = z.object({
  content: z.string().min(1, "Submission content cannot be empty."),
  fileUrl: z.string().optional(),
  fileCldPubId: z.string().optional(),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  assignmentId: number;
  existingSubmission?: Submission;
}

export const SubmissionForm = ({
  assignmentId,
  existingSubmission,
}: SubmissionFormProps) => {
  const go = useGo();
  const invalidate = useInvalidate();

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      content: existingSubmission?.content ?? "",
      fileUrl: existingSubmission?.fileUrl ?? "",
      fileCldPubId: existingSubmission?.fileCldPubId ?? "",
    },
    refineCoreProps: {
      resource: "submissions",
      action: "create",
      redirect: false, // Stop Refine from trying to find a non-existent list page
      onMutationSuccess: () => {
        // 1. Invalidate the cache so the UI knows data has changed
        invalidate({
          resource: "submissions",
          invalidates: ["list"],
        });
        
        // 2. Explicitly navigate to the current page to trigger a re-render
        go({
          to: `/assignments/show/${assignmentId}`,
          type: "replace",
        });
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
    onFinish({
      ...values,
      assignmentId,
    });
  };

  const handleFileUpload = (url: string, publicId: string) => {
    setValue("fileUrl", url);
    setValue("fileCldPubId", publicId);
  };

  const handleClearFile = () => {
    setValue("fileUrl", "");
    setValue("fileCldPubId", "");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Submission</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your submission text or a summary of your uploaded file..."
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2 border-t pt-4">
          <FileUpload 
            label="Upload File (Optional)" 
            folder="submissions"
            onUploadSuccess={handleFileUpload}
            onClear={handleClearFile}
          />
          {watch("fileUrl") && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <Paperclip className="h-3 w-3" />
              File uploaded and attached to submission
            </div>
          )}
        </div>

        <Button type="submit" disabled={formLoading} className="w-full">
          {formLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : existingSubmission ? (
            "Update Submission"
          ) : (
            "Submit Assignment"
          )}
        </Button>
      </form>
    </Form>
  );
};
