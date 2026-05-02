import React from "react";
import { useTranslation } from "react-i18next";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { ListView } from "@/components/refine/views/list-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, Zap, Globe, Save, Loader2, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { handleError } from "@/providers/utils/api-errors";

const PlatformSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const { query } = useCustom({
    url: "/settings/global-settings",
    method: "get",
  });

  const { mutate, mutation } = useCustomMutation();

  const settings = query.data?.data || {};
  const [formData, setFormData] = React.useState<any>({});

  React.useEffect(() => {
    if (query.data?.data) {
      setFormData(query.data.data);
    }
  }, [query.data]);

  const handleToggle = (key: string, val: boolean) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }));
  };

  const handleInputChange = (key: string, val: string | number) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }));
  };

  const onSave = () => {
    mutate(
      {
        url: "/settings/global-settings",
        method: "patch",
        values: formData,
      },
      {
        onSuccess: () => {
          toast.success(t("admin.settings.success", "Global settings updated successfully."));
          query.refetch();
        },
        onError: async (err) => {
          const httpError = await handleError(err);
          toast.error(httpError.message);
        },
      }
    );
  };

  if (query.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ListView
      title={t("admin.settings.title", "Platform Governance")}
      headerProps={{
        subtitle: t(
          "admin.settings.subtitle",
          "Global configuration and feature flags for the entire Tablawy OS ecosystem."
        ),
      }}
    >
      <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-6 md:grid-cols-2">
          {/* AI GOVERNANCE SECTION */}
          <Card className="glass-card border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">
                    AI Governance
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                    Feature Gating & Quotas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-tight">
                    Enable AI Features
                  </Label>
                  <p className="text-[10px] font-medium text-muted-foreground max-w-[220px]">
                    Global master switch for all generative AI capabilities.
                  </p>
                </div>
                <Switch
                  checked={formData.enableAiFeatures}
                  onCheckedChange={(v) => handleToggle("enableAiFeatures", v)}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ps-1">
                  Daily AI Token Quota
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.dailyTokenQuota}
                    onChange={(e) => handleInputChange("dailyTokenQuota", parseInt(e.target.value))}
                    className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold text-lg"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pointer-events-none">
                    Tokens / Day
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PLATFORM SECURITY SECTION */}
          <Card className="glass-card border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-amber-500/5 border-b border-amber-500/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">
                    Platform Safety
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60">
                    Verification & Compliance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-tight">
                    Safe Mode (Dry Run)
                  </Label>
                  <p className="text-[10px] font-medium text-muted-foreground max-w-[220px]">
                    Prevent external API dispatches for maintenance.
                  </p>
                </div>
                <Switch
                  checked={formData.isDryRun}
                  onCheckedChange={(v) => handleToggle("isDryRun", v)}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ps-1">
                  Registration Default Role
                </Label>
                <Input
                  value={formData.defaultRegistrationRole}
                  onChange={(e) => handleInputChange("defaultRegistrationRole", e.target.value)}
                  className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold"
                  placeholder="student"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MESSAGING SECTION */}
        <Card className="glass-card border-none shadow-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Ecosystem Comms
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/60">
                  Public Identity & UI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ps-1">
                Global Welcome Message
              </Label>
              <Input
                value={formData.welcomeMessage}
                onChange={(e) => handleInputChange("welcomeMessage", e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-medium"
                placeholder="Welcome to the Hub..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={onSave}
            disabled={mutation.isPending}
            className="h-16 px-12 rounded-[2rem] font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("buttons.saveChanges", "Save Configuration")}
          </Button>
        </div>
      </div>
    </ListView>
  );
};

export default PlatformSettingsPage;
