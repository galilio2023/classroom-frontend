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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { useGo, useCreate } from "@refinedev/core";
import { toast } from "sonner";
import { AIAssignmentHelper } from "@/components/ai-assignment-helper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const AssignmentCreate = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const go = useGo();

  const { mutate, mutation } = useCreate();
  const { isPending } = mutation;

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  const onSubmit: SubmitHandler<AssignmentFormValues> = (values) => {
    if (!classId) {
      toast.error("Could not create assignment: Class ID is missing.");
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

  const handleUseAIContent = (content: string) => {
    form.setValue("description", content);
    toast.success("AI content applied to description!");
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
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Creating..." : "Create Assignment"}
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
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                • Use the <strong>AI Helper</strong> to quickly draft learning
                objectives and instructions.
              </p>
              <p>
                • Be specific with the <strong>Topic</strong> to get better AI
                results.
              </p>
              <p>
                • You can edit the AI-generated content after applying it to the
                form.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CreateView>
  );
};
