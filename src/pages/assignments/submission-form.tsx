import { useForm, SubmitHandler } from "react-hook-form";
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
import { useCreate, useUpdate } from "@refinedev/core";
import { Submission } from "@/types";
import { FileUpload } from "@/components/file-upload";
import { Paperclip } from "lucide-react";

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
  const { mutate: createMutate, mutation: createMutation } = useCreate();
  const { mutate: updateMutate, mutation: updateMutation } = useUpdate();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      content: existingSubmission?.content ?? "",
      fileUrl: existingSubmission?.fileUrl ?? "",
      fileCldPubId: existingSubmission?.fileCldPubId ?? "",
    },
  });

  const onSubmit: SubmitHandler<SubmissionFormValues> = (values) => {
    if (existingSubmission) {
      updateMutate({
        resource: "submissions",
        id: existingSubmission.id,
        values: {
          ...values,
          assignmentId,
        },
      });
    } else {
      createMutate({
        resource: "submissions",
        values: {
          ...values,
          assignmentId,
        },
      });
    }
  };

  const handleFileUpload = (url: string, publicId: string) => {
    form.setValue("fileUrl", url);
    form.setValue("fileCldPubId", publicId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
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
          />
          {form.watch("fileUrl") && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <Paperclip className="h-3 w-3" />
              File uploaded and attached to submission
            </div>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? "Submitting..."
            : existingSubmission
            ? "Update Submission"
            : "Submit Assignment"}
        </Button>
      </form>
    </Form>
  );
};
