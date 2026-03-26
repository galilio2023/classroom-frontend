import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2 } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { FieldArrayWithId } from "react-hook-form";
import { UseFormReturnType } from "@refinedev/react-hook-form";
import { AssignmentFormValues } from "../hooks/use-assignment-form";

interface Props {
  form: any;
  rubric: {
    fields: any[];
    append: (value: { criteria: string; maxPoints: number }) => void;
    remove: (index: number) => void;
  };
  isAr: boolean;
}

export const AssignmentSettingsForm = ({ form, rubric, isAr }: Props) => {
  const { t } = useTranslation();
  const hasPeerReview = form.watch("hasPeerReview");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-4xl border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between text-start">
            <div className="space-y-1">
              <FormLabel className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("assignments.create.groupAssignment")}
              </FormLabel>
              <FormDescription className="text-xs">
                {t("assignments.create.groupDescription")}
              </FormDescription>
            </div>
            <FormField
              control={form.control}
              name="isGroupAssignment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="p-6 bg-card rounded-4xl border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between text-start">
            <div className="space-y-1">
              <FormLabel className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("assignments.list.labels.peerReview")}
              </FormLabel>
              <FormDescription className="text-xs">
                {t("assignments.create.peerReviewDescription")}
              </FormDescription>
            </div>
            <FormField
              control={form.control}
              name="hasPeerReview"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hasPeerReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-8 relative z-10 overflow-hidden"
          >
            <div className="p-8 bg-primary/5 rounded-4xl border border-primary/10 space-y-8 relative overflow-hidden text-start">
              <FormField
                control={form.control}
                name="peerReviewWeight"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      {t("assignments.create.peerWeight")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type="number"
                          {...field}
                          className="h-14 rounded-2xl bg-background border-none focus-visible:ring-primary font-black text-center text-2xl"
                        />
                        <span
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 text-xl font-black opacity-20",
                            "end-6",
                          )}
                        >
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-[10px] font-bold text-center">
                      {t("assignments.create.peerWeightDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {t("assignments.create.gradingRubric")}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      rubric.append({ criteria: "", maxPoints: 10 })
                    }
                    className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <Plus className="h-3.5 w-3.5 me-1.5" />{" "}
                    {t("buttons.addCriteria")}
                  </Button>
                </div>
                <div className="space-y-4">
                  {rubric.fields.map((field, index: number) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 items-start p-4 rounded-2xl bg-background/50 border border-black/3 dark:border-white/3 shadow-sm group"
                    >
                      <FormField
                        control={form.control}
                        name={`rubric.${index}.criteria`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "assignments.create.placeholders.criteriaName",
                                )}
                                {...field}
                                className="h-12 rounded-xl bg-muted/20 border-none font-bold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`rubric.${index}.maxPoints`}
                        render={({ field }) => (
                          <FormItem className="w-28">
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder={t(
                                    "assignments.create.placeholders.max",
                                  )}
                                  {...field}
                                  className="h-12 rounded-xl bg-muted/20 border-none font-black text-center"
                                />
                                <span
                                  className={cn(
                                    "absolute top-1/2 -translate-y-1/2 text-[9px] font-black opacity-20",
                                    "end-3",
                                  )}
                                >
                                  PTS
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => rubric.remove(index)}
                        className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
