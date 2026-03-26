import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssignmentHelper } from "@/components/ai-assignment-helper";
import { FileUpload } from "@/components/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Paperclip,
  Loader2,
  Wand2,
  X,
  BookOpen,
  Calendar,
  LayoutDashboard,
  FileText,
  Info,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Module, Class } from "@/types";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAssignmentForm } from "../hooks/use-assignment-form";
import { AssignmentSettingsForm } from "../components/assignment-settings-form";

export const AssignmentCreate = () => {
  const { t } = useTranslation();
  const { form, rubric, data, state, actions } = useAssignmentForm();

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    refineCore: { onFinish, formLoading },
  } = form;

  const selectedClassId = watch("classId");

  return (
    <CreateView className="max-w-full">
      <div className="flex flex-col gap-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none"
              >
                {t("assignments.create.teacherDashboard")}
              </Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">
              {t("buttons.createAssignment")}
            </h1>
            <p className="text-muted-foreground font-medium">
              {t("assignments.create.designAndPublish")}
            </p>
          </div>
          {!data.showAI && (
            <Button
              variant="outline"
              onClick={() => state.setShowAI(true)}
              className="gap-2 rounded-2xl h-12 px-8 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 transition-all shadow-lg shadow-ai-primary/5"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-black uppercase tracking-widest text-[10px]">
                {t("buttons.aiWritingAssistant")}
              </span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          <motion.div
            layout
            className={cn(
              "transition-all duration-500",
              data.showAI ? "xl:col-span-7" : "xl:col-span-8 xl:col-start-3",
            )}
          >
            <Card className="shadow-2xl border-none bg-card/50 backdrop-blur-xl overflow-hidden rounded-[2rem]">
              <div className="h-1.5 bg-gradient-to-r from-primary via-ai-primary to-primary w-full" />
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <LayoutDashboard className="h-4 w-4" />
                  {t("assignments.create.assignmentConfig")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <Form {...form}>
                  <form
                    onSubmit={handleSubmit((v) => onFinish(v))}
                    className="space-y-8 text-start"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <BookOpen className="h-3 w-3" />
                              {t("assignments.create.targetClass")}
                            </FormLabel>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(Number(val));
                                setValue("moduleId", null);
                              }}
                              value={field.value?.toString()}
                              disabled={!!data.urlClassId}
                            >
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none transition-all text-start">
                                  <SelectValue
                                    placeholder={t(
                                      "assignments.create.placeholders.selectClass",
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl border-none shadow-2xl">
                                {data.classes.map((c: Class) => (
                                  <SelectItem
                                    key={c.id}
                                    value={c.id.toString()}
                                    className="rounded-lg font-bold text-start"
                                  >
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                {t("assignments.create.assignmentTitle")}
                              </FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[200px] text-[10px] font-medium">
                                    {t("assignments.create.titleHelp")}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "assignments.create.placeholders.title",
                                )}
                                {...field}
                                className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={control}
                        name="moduleId"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <LayoutDashboard className="h-3 w-3" />
                              {t("assignments.create.curriculumModule")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value?.toString() || "0"}
                              disabled={!selectedClassId}
                            >
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none transition-all text-start">
                                  <SelectValue
                                    placeholder={t(
                                      "assignments.create.placeholders.selectModule",
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl border-none shadow-2xl">
                                <SelectItem
                                  value="0"
                                  className="rounded-lg font-bold text-start"
                                >
                                  {t(
                                    "assignments.create.placeholders.noneGlobal",
                                  )}
                                </SelectItem>
                                {data.modules.map((m: Module) => (
                                  <SelectItem
                                    key={m.id}
                                    value={m.id.toString()}
                                    className="rounded-lg font-bold text-start"
                                  >
                                    {m.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {t("assignments.create.submissionDeadline")}
                              </FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[200px] text-[10px] font-medium">
                                    {t("assignments.create.deadlineHelp")}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="h-14 rounded-2xl bg-muted/20 border-none font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {t("assignments.create.instructionsAndContent")}
                          </FormLabel>
                          <FormControl>
                            <div className="rounded-2xl overflow-hidden border-2 border-transparent shadow-inner">
                              <RichTextEditor
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder={t(
                                  "assignments.create.placeholders.instructions",
                                )}
                                className="min-h-[350px]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AssignmentSettingsForm
                      form={form}
                      rubric={rubric}
                      isAr={data.isAr}
                    />

                    <div className="p-8 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted-foreground/10 space-y-4 text-start">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          {t("assignments.create.referenceMaterials")}
                        </Label>
                      </div>
                      <FileUpload
                        label={t("assignments.create.uploadMaterial")}
                        folder="assignments"
                        onUploadSuccess={actions.handleFileUpload}
                      />
                      {watch("fileUrl") && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-success/5 border border-success/20 w-fit shadow-sm"
                        >
                          <div className="p-2 rounded-lg bg-success/10 text-success">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-success uppercase tracking-widest">
                              {t("assignments.create.attached")}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {t("assignments.create.attachedDesc")}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        id="guide-publish-assignment"
                        type="submit"
                        disabled={formLoading}
                        size="lg"
                        className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.98] relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
                        {formLoading ? (
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        ) : (
                          <Wand2 className="mr-3 h-6 w-6" />
                        )}
                        {formLoading
                          ? t("buttons.publishing")
                          : t("buttons.publishAssignment")}
                      </Button>
                      <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground/40">
                        <Info className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {t("assignments.create.notificationNote")}
                        </span>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Side Panel */}
          <AnimatePresence>
            {data.showAI && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="xl:col-span-5 sticky top-24"
              >
                <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-2xl overflow-hidden rounded-[2rem] border border-ai-primary/20">
                  <div className="h-1.5 bg-ai-primary w-full" />
                  <CardHeader className="bg-ai-primary/5 border-b border-ai-primary/10 p-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-ai-primary text-sm font-black uppercase tracking-widest">
                        {t("buttons.aiWritingAssistant")}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => state.setShowAI(false)}
                      className="h-10 w-10 rounded-full hover:bg-ai-primary/10 text-ai-primary"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-start">
                    <AIAssignmentHelper
                      onUseContent={actions.handleUseAIContent}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </CreateView>
  );
};
