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
import { useCreate, useUpdate } from "@refinedev/core"; // Import useUpdate
import { Submission } from "@/types";

const submissionSchema = z.object({
  content: z.string().min(1, "Submission content cannot be empty."),
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
  // Conditionally use useCreate or useUpdate
  const { mutate: createMutate, mutation: createMutation } = useCreate();
  const { mutate: updateMutate, mutation: updateMutation } = useUpdate();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      content: existingSubmission?.content ?? "",
    },
  });

  const onSubmit: SubmitHandler<SubmissionFormValues> = (values) => {
    if (existingSubmission) {
      // Update existing submission
      updateMutate({
        resource: "submissions",
        id: existingSubmission.id,
        values: {
          ...values,
          assignmentId,
        },
      });
    } else {
      // Create new submission
      createMutate({
        resource: "submissions",
        values: {
          ...values,
          assignmentId,
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Submission</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your submission text or a link to your work..."
                  rows={10}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Submitting..."
            : existingSubmission
            ? "Update Submission"
            : "Submit"}
        </Button>
      </form>
    </Form>
  );
};
