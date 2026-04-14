import { EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useSelect, useOne, useCustomMutation } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Info,
  Import,
  LayoutDashboard,
  Sparkles,
  Key,
  Loader2,
  History,
  BookOpen,
} from "lucide-react";
import { Class } from "@/types";
import { ClassForm } from "./form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useTerm } from "@/contexts/term-context";
import { motion } from "framer-motion";
import {} from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useOptimisticVersion } from "@/hooks/use-optimistic-version";
import { ConflictDialog } from "@/components/conflict-dialog";
import { useClassForm } from "../hooks/useClassForm";
import {} from "sonner";

const ClassesEdit = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { terms } = useTerm();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedSourceTerm, setSelectedSourceTerm] = useState<string>("");
  const [selectedSourceClass, setSelectedSourceClass] = useState<string>("");
  const [showConflict, setShowConflict] = useState(false);
  const [pendingServerVersion, setPendingServerVersion] = useState<number | null>(null);

  const isAr = i18n.language === "ar";

  const { query: classQuery } = useOne<Class>({
    resource: "classes",
    id,
  });

  const { form, onSubmit, subjectOptions, fields, append, remove, formLoading, setValue } =
    useClassForm("edit", id);

  const { mutate: importContent, mutation: importMutation } = useCustomMutation();
  const isImporting = importMutation.isPending;

  // 🛡️ Deep Sync: Update version in real-time from server
  useOptimisticVersion("classes", id, form, (serverVersion) => {
    setPendingServerVersion(serverVersion);
    setShowConflict(true);
  });

  const handleRefresh = async () => {
    if (pendingServerVersion) {
      setValue("version", pendingServerVersion);
      await classQuery.refetch();
      setShowConflict(false);
    }
  };

  const handleOverwrite = () => {
    setShowConflict(false);
  };

  // Sync version from initial load
  useEffect(() => {
    if (classQuery?.data?.data?.version) {
      setValue("version", classQuery.data.data.version);
    }
  }, [classQuery?.data?.data?.version, setValue]);

  const { options: sourceClassOptions } = useSelect<Class>({
    resource: "classes",
    optionLabel: "name",
    optionValue: "id",
    filters: [{ field: "termId", operator: "eq", value: selectedSourceTerm }],
    queryOptions: { enabled: !!selectedSourceTerm },
  });

  const handleImport = () => {
    if (!selectedSourceClass) return;

    importContent(
      {
        url: `/classes/import-content`,
        method: "post",
        values: {
          sourceClassId: Number(selectedSourceClass),
          targetClassId: Number(id),
        },
        successNotification: () => ({ message: t("classes.list.toast.cloned"), type: "success" }),
        errorNotification: () => ({ message: t("common.error"), type: "error" }),
      },
      {
        onSuccess: () => {
          setIsImportOpen(false);
          setSelectedSourceClass("");
          setSelectedSourceTerm("");
        },
      }
    );
  };

  return (
    <div
      className="container mx-auto py-10 px-4 md:px-6 max-w-7xl pb-20"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex flex-col gap-8">
        <div className="space-y-1 text-start">
          <EditViewHeader />
          <p className="text-muted-foreground font-medium">{t("classes.edit.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Form Column */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden text-start">
              <div className="h-1.5 bg-linear-to-r from-primary via-ai-primary to-primary w-full" />
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <LayoutDashboard className="h-4 w-4" />
                  {t("classes.edit.configuration")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <Form {...form}>
                  <form onSubmit={onSubmit}>
                    <ClassForm
                      form={form}
                      subjectOptions={subjectOptions}
                      fields={fields}
                      append={append}
                      remove={remove}
                      formLoading={formLoading}
                      isEdit={true}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar Column */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-10"
          >
            <Card className="border-none shadow-xl bg-primary/5 rounded-4xl overflow-hidden text-start">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Info className="h-4 w-4" />
                  {t("classes.edit.editingMode")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {t("classes.edit.editingModeDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden text-start">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Key className="h-4 w-4" />
                  {t("classes.edit.accessControl")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-4">
                <div className="p-4 rounded-2xl bg-muted/20 border border-black/3 dark:border-white/3 flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    {t("classes.edit.inviteCode")}
                  </span>
                  <span className="text-3xl font-black font-mono tracking-[0.2em] text-primary">
                    {classQuery?.data?.data?.inviteCode ?? "..."}
                  </span>
                </div>
                <p className="text-[10px] text-center font-medium text-muted-foreground/60 px-4">
                  {t("classes.edit.inviteCodeDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl bg-ai-primary/2 backdrop-blur-xl rounded-4xl overflow-hidden border border-ai-primary/10 text-start">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-ai-primary">
                  <Sparkles className="h-4 w-4" />
                  {t("classes.edit.contentActions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 relative overflow-hidden group shadow-sm"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                      <Import className="h-4 w-4" />
                      {t("classes.edit.importContent")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px] rounded-4xl border-none shadow-2xl bg-card/95 backdrop-blur-xl text-start">
                    <DialogHeader className="space-y-3">
                      <div className="p-3 rounded-2xl bg-ai-primary/10 text-ai-primary w-fit">
                        <Import className="h-6 w-6" />
                      </div>
                      <DialogTitle className="text-2xl font-black tracking-tight">
                        {t("classes.edit.importArchive")}
                      </DialogTitle>
                      <DialogDescription className="font-medium">
                        {t("classes.edit.importArchiveDesc")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                          {t("classes.edit.selectSourceTerm")}
                        </Label>
                        <Select onValueChange={setSelectedSourceTerm} value={selectedSourceTerm}>
                          <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-ai-primary transition-all font-bold">
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4 text-ai-primary/60" />
                              <SelectValue placeholder={t("classes.edit.selectTermPlaceholder")} />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            {terms
                              .filter((t) => t.status === "archived")
                              .map((term) => (
                                <SelectItem
                                  key={term.id}
                                  value={term.id.toString()}
                                  className="rounded-lg font-bold"
                                >
                                  {term.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                          {t("classes.edit.selectSourceClass")}
                        </Label>
                        <Select
                          onValueChange={setSelectedSourceClass}
                          value={selectedSourceClass}
                          disabled={!selectedSourceTerm}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-ai-primary transition-all font-bold">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-ai-primary/60" />
                              <SelectValue placeholder={t("classes.edit.selectClassPlaceholder")} />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            {sourceClassOptions.map((cls) => (
                              <SelectItem
                                key={cls.value}
                                value={cls.value.toString()}
                                className="rounded-lg font-bold"
                              >
                                {cls.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="gap-3">
                      <Button
                        variant="ghost"
                        className="rounded-xl font-bold h-12"
                        onClick={() => setIsImportOpen(false)}
                      >
                        {t("buttons.cancel")}
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={!selectedSourceClass || isImporting}
                        className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-ai-primary/20 bg-ai-primary text-white hover:bg-ai-primary/90"
                      >
                        {isImporting ? (
                          <Loader2 className="h-4 w-4 me-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 me-2" />
                        )}
                        {t("classes.edit.importContent")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-[10px] text-center font-medium text-muted-foreground/40 px-4">
                  {t("classes.edit.importFooterDesc")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <ConflictDialog
          isOpen={showConflict}
          onRefresh={handleRefresh}
          onOverwrite={handleOverwrite}
        />
      </div>
    </div>
  );
};

export default ClassesEdit;
