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
import { Submission } from "@/types";
import { FileUpload } from "@/components/file-upload";
import { Paperclip } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { useGo, useInvalidate } from "@refinedev/core";
import { LoadingButton } from "@/components/ui/loading-button";
import { useState } from "react";

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
  const [isSuccess, setIsSuccess] = useState(false);

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
      redirect: false,
      onMutationSuccess: () => {
        setIsSuccess(true);
        invalidate({
          resource: "submissions",
          invalidates: ["list"],
        });
        
        setTimeout(() => {
          setIsSuccess(false);
          go({
            to: `/assignments/show/${assignmentId}`,
            type: "replace",
          });
        }, 1000);
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

        <LoadingButton 
          type="submit" 
          isLoading={formLoading} 
          isSuccess={isSuccess}
          className="w-full"
        >
          {existingSubmission ? "Update Submission" : "Submit Assignment"}
        </LoadingButton>
      </form>
    </Form>
  );
};
