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
  // MANDATORY: Use Refine v5 useForm pattern with refineCoreProps
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    refineCore: { onFinish, formLoading },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      content: existingSubmission?.content ?? "",
      fileUrl: existingSubmission?.fileUrl ?? "",
      fileCldPubId: existingSubmission?.fileCldPubId ?? "",
    },
    refineCoreProps: {
      resource: "submissions",
      action: existingSubmission ? "edit" : "create",
      id: existingSubmission?.id,
      redirect: false, // Stay on page after submission
      onMutationSuccess: () => {
        // Optional: Add custom success logic here
      }
    },
  });

  const onSubmit = (values: SubmissionFormValues) => {
    onFinish({
      ...values,
      assignmentId,
    });
  };

  const handleFileUpload = (url: string, publicId: string) => {
    setValue("fileUrl", url);
    setValue("fileCldPubId", publicId);
  };

  return (
    <Form 
      register={register} 
      control={control} 
      handleSubmit={handleSubmit} 
      formState={{ errors }} 
      setValue={setValue} 
      watch={watch} 
      {...({} as any)} // Type helper for shadcn Form wrapper
    >
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
