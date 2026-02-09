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
import { useCreate } from "@refinedev/core";
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
  const { mutate, mutation } = useCreate();
  const { isPending } = mutation;

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      content: existingSubmission?.content ?? "",
    },
  });

  const onSubmit: SubmitHandler<SubmissionFormValues> = (values) => {
    mutate({
      resource: "submissions",
      values: {
        ...values,
        assignmentId,
      },
    });
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
