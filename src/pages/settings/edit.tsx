import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Settings as SettingsIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useOne, useUpdate } from "@refinedev/core";
import { useEffect } from "react";
import { UserRole } from "@/types"; // Assuming UserRole enum is accessible

// Define the schema for global settings
const settingsSchema = z.object({
  enableAiFeatures: z.boolean(),
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
      defaultRegistrationRole: UserRole.STUDENT,
      welcomeMessage: undefined, // Explicitly set to undefined for optional field
    },
  });

  // Populate form with fetched data
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
            }),
          );
        },
      },
    );
  };

  return (
    <EditView>
      <div className="space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
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

        <Card className="rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden border-border/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
          <CardHeader className="pt-10 md:pt-14 pb-6 md:pb-10 space-y-4 md:space-y-6 text-center">
            <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight">
              {t("settings.form.title")}
            </CardTitle>
            <CardDescription className="font-medium text-base md:text-lg px-4 md:px-8">
              {t("settings.form.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-12 pb-10 md:pb-14">
            {isFetchingSettings ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="enableAiFeatures"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("settings.form.enableAiFeatures.label")}
                          </FormLabel>
                          <FormDescription>
                            {t("settings.form.enableAiFeatures.description")}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultRegistrationRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("settings.form.defaultRegistrationRole.label")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  "settings.form.defaultRegistrationRole.placeholder",
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                            <SelectItem value={UserRole.STUDENT}>
                              {t("roles.student")}
                            </SelectItem>
                            <SelectItem value={UserRole.TEACHER}>
                              {t("roles.teacher")}
                            </SelectItem>
                            <SelectItem value={UserRole.PARENT}>
                              {t("roles.parent")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t(
                            "settings.form.defaultRegistrationRole.description",
                          )}
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
                        <FormLabel>
                          {t("settings.form.welcomeMessage.label")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "settings.form.welcomeMessage.placeholder",
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("settings.form.welcomeMessage.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUpdatingSettings}
                  >
                    {isUpdatingSettings ? (
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : (
                      <SettingsIcon className="h-4 w-4 me-2" />
                    )}
                    {t("buttons.saveSettings")}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </EditView>
  );
};

export default SettingsEditPage;
