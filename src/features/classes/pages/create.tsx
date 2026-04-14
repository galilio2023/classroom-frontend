import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { useBack } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ChevronLeft, LayoutDashboard, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useClassForm } from "../hooks/useClassForm";
import { ClassForm } from "./form";

const ClassesCreate = () => {
  const { t, i18n } = useTranslation();
  const back = useBack();
  const isAr = i18n.language === "ar";

  const {
    form,
    onSubmit,
    subjectOptions,
    subjectsLoading,
    terms,
    termsLoading,
    fields,
    append,
    remove,
    formLoading,
    isCreatingNewSubject,
    setIsCreatingNewSubject,
  } = useClassForm("create");

  const selectedColor = form.watch("color");

  return (
    <CreateView className="class-view pb-20">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-start">
          <div className="space-y-1">
            <Breadcrumb />
            <h1 className="text-4xl font-black tracking-tighter leading-none">
              {t("classes.create.title")}
            </h1>
            <p className="text-muted-foreground font-medium">{t("classes.create.description")}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => back()}
            className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 text-primary transition-all"
          >
            <ChevronLeft className={cn("h-4 w-4", isAr && "rotate-180")} />
            {t("buttons.goBack")}
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden text-start">
            <div
              className="h-1.5 w-full transition-colors duration-500"
              style={{ backgroundColor: selectedColor }}
            />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                <LayoutDashboard className="h-4 w-4" />
                {t("classes.create.configuration")}
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
                    isEdit={false}
                    isCreatingNewSubject={isCreatingNewSubject}
                    setIsCreatingNewSubject={setIsCreatingNewSubject}
                    subjectsLoading={subjectsLoading}
                  />
                </form>
              </Form>

              <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/40">
                <Info className="h-3.5 w-3.5" />
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                  {t("classes.create.inviteNote")}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </CreateView>
  );
};

export default ClassesCreate;
