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
import { Submission, Assignment, ProjectGroup } from "@/types";
import { FileUpload } from "@/components/file-upload";
import {
  Paperclip,
  FileText,
  CheckCircle2,
  Info,
  Sparkles,
  Send,
  Save,
  History,
  Users,
  X,
  Reply
} from "lucide-react";
import { useGo, useInvalidate, useList, HttpError, BaseRecord } from "@refinedev/core";
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
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const submissionSchema = (t: TFunction) =>
  z.object({
    content: z.string().min(1, t("assignments.form.toast.contentRequired")),
    fileUrl: z.string().optional(),
    fileCldPubId: z.string().optional(),
    isDraft: z.boolean().default(false),
    groupId: z.coerce.number().optional().nullable(),
    assignmentId: z.number().optional(),
  });

type SubmissionFormValues = z.infer<ReturnType<typeof submissionSchema>>;

interface SubmissionFormProps {
  assignmentId: number;
  existingSubmission?: Submission;
  latestAttemptNumber?: number;
  assignment?: Assignment;
  onCancel?: () => void;
}

export const SubmissionForm = ({
  assignmentId,
  existingSubmission,
  latestAttemptNumber = 0,
  assignment,
  onCancel,
}: SubmissionFormProps) => {
  const { t, i18n } = useTranslation();

  const go = useGo();
  const invalidate = useInvalidate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch groups for the class if it's a group assignment
  const { query: groupsQuery } = useList<ProjectGroup>({
    resource: "project-groups",
    filters: [{ field: "classId", operator: "eq", value: assignment?.classId }],
    queryOptions: {
      enabled: !!assignment?.isGroupAssignment && !!assignment?.classId,
    },
  });

  const groups = groupsQuery?.data?.data || [];

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema(t)) as any,
    defaultValues: {
      content: existingSubmission?.content ?? "",
      fileUrl: existingSubmission?.fileUrl ?? "",
      fileCldPubId: existingSubmission?.fileCldPubId ?? "",
      isDraft: false,
      groupId: existingSubmission?.groupId ?? null,
    },
    refineCoreProps: {
      resource: "submissions",
      action: "create",
      redirect: false,
      onMutationSuccess: (data) => {
        const isDraft = (data.data as any)?.isDraft;
        setIsSuccess(true);
        setSuccessMessage(
          isDraft
            ? t("assignments.form.toast.draftSaved")
            : t("assignments.form.toast.submitted"),
        );

        void invalidate({
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

  const onSubmit = (values: SubmissionFormValues) => {
    void onFinish({
      ...values,
      assignmentId,
    });
  };

  const handleSaveDraft = () => {
    const values = form.getValues();
    void onFinish({
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

  const currentAttempt = existingSubmission?.isDraft
    ? latestAttemptNumber
    : latestAttemptNumber + 1;
  const isAr = i18n.language === "ar";

  const tips = t("assignments.form.tips", { returnObjects: true });
  const tipsList = Array.isArray(tips) ? tips : [];

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit as any)}
        className="space-y-8 relative text-start"
      >
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
                <CheckCircle2 className="h-12 w-12 stroke-3" />
              </motion.div>
              <h3 className="text-2xl font-black tracking-tight">
                {successMessage}
              </h3>
              <p className="text-muted-foreground font-medium">
                {t("assignments.form.successRedirecting")}
              </p>
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                    {t("assignments.form.submissionStatus")}
                  </p>
                  <p className="text-sm font-black tracking-tight">
                    {existingSubmission?.isDraft
                      ? t("assignments.form.editingDraft")
                      : t("assignments.form.submittingAttempt", {
                          count: currentAttempt,
                        })}
                  </p>
                </div>
              </div>
              {existingSubmission?.isDraft && (
                <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                  {t("assignments.form.draftMode")}
                </Badge>
              )}
            </div>

            {/* Group Selection for Group Assignments */}
            {assignment?.isGroupAssignment && (
              <div className="p-6 bg-card rounded-3xl border border-border shadow-sm">
                <FormField
                  control={control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {t("assignments.form.selectGroup")}
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value?.toString()}
                        disabled={!!existingSubmission} // Cannot change group after first save/submit for consistency
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-primary text-start">
                            <SelectValue
                              placeholder={t(
                                "assignments.form.selectGroupPlaceholder",
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem
                              key={group.id}
                              value={group.id.toString()}
                              className="text-start"
                            >
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground">
                        {t("assignments.form.groupNote")}
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
                <FormItem className="space-y-3 text-start">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {t("assignments.form.yourSubmission")}
                    </FormLabel>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                        {t("assignments.form.wordsCount", { count: wordCount })}
                      </span>
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Textarea
                        placeholder={t("assignments.form.contentPlaceholder")}
                        className="min-h-75 rounded-3xl resize-none bg-muted/20 border-2 border-transparent focus-visible:ring-primary focus-visible:border-primary/20 p-6 text-sm leading-relaxed shadow-inner transition-all scrollbar-thin scrollbar-thumb-primary/10"
                        {...field}
                      />
                      <div
                        className={cn(
                          "absolute bottom-4 opacity-10 group-focus-within:opacity-30 transition-opacity",
                          isAr ? "left-4" : "right-4",
                        )}
                      >
                        <FileText className="h-8 w-8" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 text-start">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                <span className="w-1 h-1 rounded-full bg-primary" />
                {t("assignments.form.supportingDocs")}
              </Label>
              <div
                className={cn(
                  "p-6 rounded-3xl border-2 border-dashed transition-all",
                  fileUrl
                    ? "bg-success/5 border-success/20"
                    : "bg-muted/10 border-muted-foreground/10 hover:border-primary/20 hover:bg-primary/2",
                )}
              >
                <FileUpload
                  label={
                    fileUrl
                      ? t("assignments.form.fileAttached")
                      : t("assignments.form.uploadFile")
                  }
                  folder="submissions"
                  onUploadSuccess={handleFileUpload}
                  onClear={handleClearFile}
                />
                <AnimatePresence>
                  {fileUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-muted/10 shadow-sm border border-success/10"
                    >
                      <div className="p-2 rounded-lg bg-success/10 text-success">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col text-start">
                        <span className="text-xs font-bold text-success">
                          {t("assignments.form.fileSuccess")}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          {t("assignments.form.readyForSubmission")}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6 text-start">
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Info className="h-3.5 w-3.5" />
                </div>
                {t("assignments.form.submissionTips")}
              </h4>
              <ul className="space-y-3">
                {tipsList.map((tip: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs font-medium text-muted-foreground"
                  >
                    <div className="mt-1 size-1 rounded-full bg-primary/40" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("assignments.form.aiReady")}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  {t("assignments.form.aiDescription")}
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
                {t("buttons.saveAsDraft")}
              </Button>

              <LoadingButton
                type="submit"
                isLoading={formLoading}
                isSuccess={isSuccess}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-2"
              >
                <Send className={cn("h-4 w-4", isAr && "rotate-180")} />
                {existingSubmission && !existingSubmission.isDraft
                  ? t("buttons.resubmitWork")
                  : t("buttons.turnInNow")}
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
                  {t("buttons.cancel")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
