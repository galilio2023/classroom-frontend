import { SubmitHandler, useForm } from "react-hook-form";
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
import { useGo, useCreate } from "@refinedev/core";

// 1. Define the form's data shape
const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

// 2. Create a TypeScript type from the schema
type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const AssignmentCreate = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const go = useGo();

  // 3. Use Refine's useCreate hook for submission and get the mutation object
  const { mutate, mutation } = useCreate();
  const { isPending } = mutation;

  // 4. Use the standard useForm hook from react-hook-form, correctly typed
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  // 5. Create a correctly typed SubmitHandler
  const onSubmit: SubmitHandler<AssignmentFormValues> = (values) => {
    if (!classId) {
      console.error("Class ID is missing!");
      return;
    }
    mutate(
      {
        resource: "assignments",
        values: {
          ...values,
          classId: Number(classId),
        },
      },
      {
        onSuccess: () => {
          go({ to: `/classes/show/${classId}`, type: "replace" });
        },
      },
    );
  };

  return (
    <CreateView>
      <Card>
        <CardHeader>
          <CardTitle>New Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chapter 5 Reading" {...field} />
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
                      <Textarea
                        placeholder="Instructions for the assignment..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Assignment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CreateView>
  );
};
