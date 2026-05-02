import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { Settings as SettingsIcon, Loader2, History, Layout, Paintbrush } from "lucide-react";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useOne, useUpdate } from "@refinedev/core";
import { useEffect } from "react";
import { UserRole } from "@/types";
import { useCapabilities } from "@/hooks/use-capabilities";
import { SettingsAuditLog } from "./components/audit-log";
import { HubSuiteSettings } from "@/features/onboarding/components/HubSuiteSettings";
import { BrandingSection } from "./components/BrandingSection";

// Define the schema for global settings
const settingsSchema = z.object({
  enableAiFeatures: z.boolean(),
  isDryRun: z.boolean(),
  dailyTokenQuota: z.coerce.number().min(0).max(1000000),
  maxAiTokenLimit: z.coerce.number().min(0).max(32000),
  defaultRegistrationRole: z.nativeEnum(UserRole),
  welcomeMessage: z
    .string()
    .min(1, "Welcome message cannot be empty")
    .max(500, "Welcome message too long")
    .optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const SettingsEditPage = () => {
  const { t } = useTranslation();
  const { isOwner, canCustomBrand } = useCapabilities();
  usePageTitle(t("settings.title"));

  const SETTINGS_ID = "global-settings";

  const { query } = useOne<SettingsFormValues>({
    resource: "settings",
    id: SETTINGS_ID,
  });

  const { data: dataResult, isLoading: isFetchingSettings } = query;
  const data = dataResult?.data;

  const { mutate: updateSettings, mutation } = useUpdate();
  const isUpdatingSettings = mutation.isPending;

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      enableAiFeatures: true,
      isDryRun: false,
      dailyTokenQuota: 50000,
      maxAiTokenLimit: 8000,
      defaultRegistrationRole: UserRole.STUDENT,
      welcomeMessage: undefined,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  const onSubmit = (values: SettingsFormValues) => {
    updateSettings(
      {
        resource: "settings",
        id: SETTINGS_ID,
        values: values,
      },
      {
        onSuccess: () => {
          toast.success(t("settings.toasts.success"));
        },
        onError: (error) => {
          toast.error(
            t("settings.toasts.error", {
              message: error?.message || "Unknown error",
            })
          );
        },
      }
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 max-w-7xl pb-20">
      <div className="space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-start"
        >
          <div className="space-y-4 flex-1">
            <Breadcrumb />
            <div className="space-y-1">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <SettingsIcon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("settings.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("settings.description")}
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="general" className="w-full space-y-8">
          <div className="flex justify-center">
            <TabsList className="h-12 items-center justify-center rounded-full p-1 bg-muted/20 gap-1">
              <TabsTrigger
                value="general"
                className="px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              >
                <SettingsIcon className="h-3.5 w-3.5" />
                General
              </TabsTrigger>
              {canCustomBrand && (
                <TabsTrigger
                  value="branding"
                  className="px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
                >
                  <Paintbrush className="h-3.5 w-3.5" />
                  Branding
                </TabsTrigger>
              )}
              {isOwner && (
                <TabsTrigger
                  value="hub"
                  className="px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
                >
                  <Layout className="h-3.5 w-3.5" />
                  Hub Suite
                </TabsTrigger>
              )}
              <TabsTrigger
                value="audit"
                className="px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              >
                <History className="h-3.5 w-3.5" />
                Audit Log
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="mt-0 focus-visible:outline-none">
            <Card className="rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-xl border-border/40 shadow-2xl overflow-hidden">
              <CardHeader className="pt-10 md:pt-14 pb-6 md:pb-10 space-y-4 md:space-y-6 text-center">
                <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight">
                  {t("settings.form.title")}
                </CardTitle>
                <CardDescription className="font-medium text-base md:text-lg px-4 md:px-8 text-balance">
                  {t("settings.form.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 md:px-12 pb-10 md:pb-14">
                {isFetchingSettings ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-start">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="enableAiFeatures"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-6 bg-background/50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base font-black uppercase tracking-tight">
                                  {t("settings.form.enableAiFeatures.label")}
                                </FormLabel>
                                <FormDescription className="text-xs font-medium">
                                  {t("settings.form.enableAiFeatures.description")}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isDryRun"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base font-black uppercase tracking-tight text-orange-600">
                                  {t("aiHub.assistant.mockMode")}
                                </FormLabel>
                                <FormDescription className="text-xs font-medium text-orange-600/60">
                                  {t("aiHub.assistant.mockModeDesc")}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="dailyTokenQuota"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("settings.form.dailyTokenQuota.label")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl bg-muted/20 border-none font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-[10px]">
                                {t("settings.form.dailyTokenQuota.description")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maxAiTokenLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("settings.form.maxAiTokenLimit.label")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl bg-muted/20 border-none font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-[10px]">
                                {t("settings.form.maxAiTokenLimit.description")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="defaultRegistrationRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {t("settings.form.defaultRegistrationRole.label")}
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                                  <SelectValue
                                    placeholder={t(
                                      "settings.form.defaultRegistrationRole.placeholder"
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl border-none shadow-2xl">
                                <SelectItem value={UserRole.STUDENT}>
                                  {t("roles.student")}
                                </SelectItem>
                                <SelectItem value={UserRole.TEACHER}>
                                  {t("roles.teacher")}
                                </SelectItem>
                                <SelectItem value={UserRole.PARENT}>{t("roles.parent")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-[10px]">
                              {t("settings.form.defaultRegistrationRole.description")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="welcomeMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {t("settings.form.welcomeMessage.label")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-12 rounded-xl bg-muted/20 border-none font-bold"
                                placeholder={t("settings.form.welcomeMessage.placeholder")}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-[10px]">
                              {t("settings.form.welcomeMessage.description")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                        disabled={isUpdatingSettings}
                      >
                        {isUpdatingSettings ? (
                          <Loader2 className="h-5 w-5 animate-spin me-3" />
                        ) : (
                          <SettingsIcon className="h-5 w-5 me-3" />
                        )}
                        {t("buttons.saveSettings")}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canCustomBrand && (
            <TabsContent value="branding" className="mt-0 focus-visible:outline-none">
              <BrandingSection />
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent value="hub" className="mt-0 focus-visible:outline-none">
              <HubSuiteSettings />
            </TabsContent>
          )}

          <TabsContent value="audit" className="mt-0 focus-visible:outline-none">
            <SettingsAuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsEditPage;
