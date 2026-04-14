import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, BadgeDollarSign, Users, Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

interface MonetizationSectionProps {
  form: UseFormReturn<any>;
}

export const MonetizationSection = ({ form }: MonetizationSectionProps) => {
  const { t } = useTranslation();

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden border-2 border-dashed border-ai-primary/10">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60 text-start">
          <CircleDollarSign className="h-4 w-4" />
          {t("classes.form.monetization")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-8">
        <FormField
          control={form.control}
          name="isPaid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-ai-primary/10 bg-ai-primary/5 p-6 shadow-sm">
              <div className="space-y-0.5 text-start">
                <FormLabel className="text-base font-black tracking-tight">
                  {t("classes.form.paidClass")}
                </FormLabel>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {t("classes.form.paidClassDescription")}
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {form.watch("isPaid") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start pt-2">
                <FormField
                  control={form.control}
                  name="priceAmount"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <BadgeDollarSign className="h-3 w-3" />
                        {t("classes.form.price")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-black text-2xl px-6"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Math.round(parseFloat(e.target.value) * 100))
                            }
                            value={field.value ? (field.value / 100).toFixed(2) : ""}
                          />
                          <div className="absolute inset-y-0 end-6 flex items-center pointer-events-none">
                            <span className="text-sm font-black opacity-20 uppercase">
                              {form.watch("currency") || "USD"}
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {t("classes.form.currency")}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="USD" className="font-bold">
                            USD - US Dollar
                          </SelectItem>
                          <SelectItem value="EUR" className="font-bold">
                            EUR - Euro
                          </SelectItem>
                          <SelectItem value="EGP" className="font-bold">
                            EGP - Egyptian Pound
                          </SelectItem>
                          <SelectItem value="SAR" className="font-bold">
                            SAR - Saudi Riyal
                          </SelectItem>
                          <SelectItem value="AED" className="font-bold">
                            AED - UAE Dirham
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-[10px] font-medium text-amber-700/80 leading-relaxed">
                  {t("classes.form.stripeConnectNote", {
                    defaultValue:
                      "Note: Ensure you have connected your Stripe account in settings to receive payments.",
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
