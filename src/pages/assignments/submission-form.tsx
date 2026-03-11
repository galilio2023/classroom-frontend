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
import { Submission, User, Assignment } from "@/types"; // Ensure Assignment is imported
import { FileUpload } from "@/components/file-upload";
import { Paperclip, FileText, CheckCircle2, Info, Sparkles, Send, Save, History, Users, X } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { useGo, useInvalidate, useGetIdentity, useList } from "@refinedev/core";
import { LoadingButton } from "@/components/ui/loading-button";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const submissionSchema = z.object({
  content: z.string().min(1, "Submission content cannot be empty."),
  fileUrl: z.string().optional(),
  fileCldPubId: z.string().optional(),
  isDraft: z.boolean().default(false),
  groupId: z.coerce.number().optional().nullable(), // Added group ID
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  assignmentId: number;
  existingSubmission?: Submission;
  latestAttemptNumber?: number;
  assignment?: Assignment; // Added assignment prop
  onCancel?: () => void;
}

export const SubmissionForm = ({
  assignmentId,
  existingSubmission,
  latestAttemptNumber = 0,
  assignment, // Added assignment prop
  onCancel,
}: SubmissionFormProps) => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { data: identity } = useGetIdentity<User>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Submission Received!");

  // Fetch groups for the class if it's a group assignment
  const { result: groupsResult } = useList({
    resource: "project-groups",
    filters: [{ field: "classId", operator: "eq", value: assignment?.classId }],
    queryOptions: { enabled: !!assignment?.isGroupAssignment && !!assignment?.classId },
  });

  const groups = groupsResult?.data || [];

  // Filter groups to find the one the user belongs to (optional, but good UX)
  // For now, we'll list all groups in the class and let them pick (or auto-select if possible)
  // In a stricter system, we'd force the user's group.

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      content: existingSubmission?.content ?? "",
      fileUrl: existingSubmission?.fileUrl ?? "",
      fileCldPubId: existingSubmission?.fileCldPubId ?? "",
      isDraft: false,
      groupId: existingSubmission?.groupId ?? null, // Pre-fill if editing
    },
    refineCoreProps: {
      resource: "submissions",
      action: "create",
      redirect: false,
      onMutationSuccess: (data: any) => {
        setIsSuccess(true);
        setSuccessMessage(data?.data?.isDraft ? "Draft Saved Successfully!" : "Assignment Submitted!");
        
        invalidate({
          resource: "submissions",
          invalidates: ["list"],
        });
        
        setTimeout(() => {
          setIsSuccess(false);
          if (onCancel) {
             onCancel();
          } else {
             go({
                to: `/assignments/show/${assignmentId}`,
                type: "replace",
              });
          }
        }, 1500);
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

  const content = watch("content");
  const fileUrl = watch("fileUrl");

  const wordCount = useMemo(() => {
    return content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  }, [content]);

  const onSubmit = (values: FieldValues) => {
    if (assignment?.isGroupAssignment && !values.groupId) {
        // This should be caught by Zod if we made it required, but custom logic is safer here
        // toast.error("Please select a group"); // Handled by optional?
    }
    
    onFinish({
      ...values,
      assignmentId,
    });
  };

  const handleSaveDraft = () => {
    const values = form.getValues();
    onFinish({
      ...values,
      assignmentId,
      isDraft: true,
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

  const currentAttempt = existingSubmission?.isDraft ? latestAttemptNumber : latestAttemptNumber + 1;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative">
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-2xl"
            >
              <motion.div 
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="p-4 rounded-full bg-success/10 text-success"
              >
                <CheckCircle2 className="h-12 w-12 stroke-[3]" />
              </motion.div>
              <h3 className="text-2xl font-black tracking-tight">{successMessage}</h3>
              <p className="text-muted-foreground font-medium">Redirecting to assignment details...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Submission Status</p>
                  <p className="text-sm font-black tracking-tight">
                    {existingSubmission?.isDraft ? "Editing Draft" : `Submitting Attempt #${currentAttempt}`}
                  </p>
                </div>
              </div>
              {existingSubmission?.isDraft && (
                <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                  Draft Mode
                </Badge>
              )}
            </div>

            {/* Group Selection for Group Assignments */}
            {assignment?.isGroupAssignment && (
                <div className="p-6 bg-card rounded-[1.5rem] border border-border shadow-sm">
                    <FormField
                        control={control}
                        name="groupId"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    Select Your Group
                                </FormLabel>
                                <Select 
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}
                                    disabled={!!existingSubmission} // Cannot change group after first save/submit for consistency
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-primary">
                                            <SelectValue placeholder="Which group are you submitting for?" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {groups.map((group: any) => (
                                            <SelectItem key={group.id} value={group.id.toString()}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">
                                    This submission will count for all members of the selected group.
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      Your Submission
                    </FormLabel>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                        {wordCount} words
                      </span>
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Textarea
                        placeholder="Enter your submission text or a summary of your uploaded file..."
                        className="min-h-[300px] rounded-[1.5rem] resize-none bg-muted/20 border-2 border-transparent focus-visible:ring-primary focus-visible:border-primary/20 p-6 text-sm leading-relaxed shadow-inner transition-all scrollbar-thin scrollbar-thumb-primary/10"
                        {...field}
                      />
                      <div className="absolute bottom-4 right-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
                        <FileText className="h-8 w-8" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                Supporting Documents
              </Label>
              <div className={cn(
                "p-6 rounded-[1.5rem] border-2 border-dashed transition-all",
                fileUrl ? "bg-success/5 border-success/20" : "bg-muted/10 border-muted-foreground/10 hover:border-primary/20 hover:bg-primary/[0.02]"
              )}>
                <FileUpload 
                  label={fileUrl ? "File Attached" : "Upload File (Optional)"} 
                  folder="submissions"
                  onUploadSuccess={handleFileUpload}
                  onClear={handleClearFile}
                />
                <AnimatePresence>
                  {fileUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-success/10"
                    >
                      <div className="p-2 rounded-lg bg-success/10 text-success">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-success">File attached successfully</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Ready for submission</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-[1.5rem] bg-primary/5 border border-primary/10 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Info className="h-3.5 w-3.5" />
                </div>
                Submission Tips
              </h4>
              <ul className="space-y-3">
                {[
                  "Review your work for clarity",
                  "Ensure all files are attached",
                  "Check the rubric requirements",
                  "Submit before the deadline"
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-medium text-muted-foreground">
                    <div className="mt-1 size-1 rounded-full bg-primary/40" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Ready</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  Your submission will be analyzed by our AI Grading Agent for preliminary feedback.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={formLoading}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-primary/5 text-primary gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              
              <LoadingButton 
                type="submit" 
                isLoading={formLoading} 
                isSuccess={isSuccess}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-2"
              >
                <Send className="h-4 w-4" />
                {existingSubmission && !existingSubmission.isDraft ? "Resubmit Work" : "Turn In Now"}
              </LoadingButton>

               {onCancel && (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={formLoading}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive gap-2"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
