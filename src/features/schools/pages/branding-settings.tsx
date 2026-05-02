import React from "react";
import { useTranslation } from "react-i18next";
import { useGetIdentity, useCustomMutation } from "@refinedev/core";
import { ListView } from "@/components/refine/views/list-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Paintbrush,
  Save,
  Loader2,
  Image as ImageIcon,
  Building2,
  Upload,
  Eye,
  Layout,
  Menu,
  Bell,
  Search,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { User, School } from "@/types";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useTusUpload } from "@/hooks/use-tus-upload";
import { handleError } from "@/providers/utils/api-errors";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const BrandingSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: identity, refetch: refetchIdentity } = useGetIdentity<User>();
  const { canCustomBrand, isAdmin } = useCapabilities();
  const { mutate: updateBranding, mutation } = useCustomMutation();
  const { mutate: updateGovernance, mutation: govMutation } = useCustomMutation();
  const { startUpload, progress, status: uploadStatus, uploadUrl } = useTusUpload();

  const [formData, setFormData] = React.useState({
    name: identity?.schoolName || "",
    primaryColor: identity?.brandingConfig?.primaryColor || "#4f46e5",
    secondaryColor: identity?.brandingConfig?.secondaryColor || "#10b981",
    logoUrl: identity?.brandingConfig?.logoUrl || "",
    isAiEnabled: identity?.school?.isAiEnabled ?? true,
    aiMonthlyLimit: identity?.school?.aiMonthlyLimit || "1000000",
  });

  React.useEffect(() => {
    if (identity) {
      setFormData({
        name: identity.schoolName || "",
        primaryColor: identity.brandingConfig?.primaryColor || "#4f46e5",
        secondaryColor: identity.brandingConfig?.secondaryColor || "#10b981",
        logoUrl: identity.brandingConfig?.logoUrl || "",
        isAiEnabled: identity.school?.isAiEnabled ?? true,
        aiMonthlyLimit: identity.school?.aiMonthlyLimit || "1000000",
      });
    }
  }, [identity]);

  React.useEffect(() => {
    if (uploadStatus === "success" && uploadUrl) {
      setFormData((prev) => ({ ...prev, logoUrl: uploadUrl }));
      toast.success("Logo uploaded successfully.");
    }
  }, [uploadStatus, uploadUrl]);

  const handleInputChange = (key: string, val: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startUpload(file, null); // Token handled by interceptor if needed
    }
  };

  const onSave = () => {
    // 1. Update Identity & Branding
    updateBranding(
      {
        url: `${import.meta.env.VITE_API_URL}/schools/branding`,
        method: "patch",
        values: {
          name: formData.name,
          brandingConfig: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            logoUrl: formData.logoUrl,
          },
        },
      },
      {
        onSuccess: () => {
          // Update CSS variable immediately for UX
          document.documentElement.style.setProperty("--primary", formData.primaryColor);
        },
        onError: async (err) => {
          const httpError = await handleError(err);
          toast.error(httpError.message);
        },
      }
    );

    // 2. Update Governance (Admin Only)
    if (isAdmin) {
      updateGovernance(
        {
          url: `${import.meta.env.VITE_API_URL}/schools/governance`,
          method: "patch",
          values: {
            isAiEnabled: formData.isAiEnabled,
            aiMonthlyLimit: formData.aiMonthlyLimit,
          },
        },
        {
          onSuccess: () => {
            toast.success(t("schools.settings.success", "Institutional settings synchronized."));
            refetchIdentity();
          },
        }
      );
    } else {
      toast.success(t("schools.branding.success", "Identity updated successfully."));
      refetchIdentity();
    }
  };

  if (!canCustomBrand) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-4xl border-border/40 shadow-xl bg-card/40 backdrop-blur-3xl">
          <Paintbrush className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black italic uppercase">Access Restricted</h2>
          <p className="text-muted-foreground font-medium">
            Custom branding is a premium feature. Please upgrade your suite to enable
            white-labeling.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <ListView
      title={t("schools.branding.title", "Platform Identity")}
      headerProps={{
        subtitle: t(
          "schools.branding.subtitle",
          "Project your institution's authority with custom colors, logos, and naming."
        ),
      }}
    >
      <div className="grid gap-10 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="lg:col-span-2 space-y-8">
          {/* GENERAL IDENTITY */}
          <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Institutional Name
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-3 text-start">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">
                  Display Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold text-lg"
                  placeholder="e.g. Tablawy University"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI GOVERNANCE (Admin Only) */}
          {isAdmin && (
            <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl">
              <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight">
                      Governance & Quotas
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/60">
                      Institutional AI Control
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <Label className="text-sm font-black uppercase tracking-tight">
                      Master AI Switch
                    </Label>
                    <p className="text-[10px] font-medium text-muted-foreground max-w-[220px]">
                      Enable or disable all AI features for this institution instantly.
                    </p>
                  </div>
                  <Switch
                    checked={formData.isAiEnabled}
                    onCheckedChange={(v: boolean) => handleInputChange("isAiEnabled", v)}
                  />{" "}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ps-1">
                      Monthly Token Limit
                    </Label>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      {Math.round(
                        (Number(identity?.school?.aiTokensUsed || 0) /
                          Number(formData.aiMonthlyLimit || 1)) *
                          100
                      )}
                      % Used
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.aiMonthlyLimit}
                      onChange={(e) => handleInputChange("aiMonthlyLimit", e.target.value)}
                      className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold text-lg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pointer-events-none">
                      Tokens / Month
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (Number(identity?.school?.aiTokensUsed || 0) / Number(formData.aiMonthlyLimit || 1)) * 100)}%`,
                      }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            {/* COLORS */}
            <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl">
              <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                    <Paintbrush className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">
                    Visual Theme
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4 text-start">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Primary Palette
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div
                        className="h-16 w-16 rounded-2xl shadow-2xl border-4 border-background cursor-pointer overflow-hidden"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                        />
                      </div>
                    </div>
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-mono font-black uppercase tracking-widest"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LOGO */}
            <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl">
              <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500 text-white">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">
                    Institution Logo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6 text-start">
                <div className="relative">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <Label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center p-8 rounded-3xl bg-muted/30 border-2 border-dashed border-border/60 hover:bg-muted/50 transition-all cursor-pointer group"
                  >
                    {uploadStatus === "uploading" ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    ) : formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="h-12 object-contain" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Upload SVG/PNG
                        </span>
                      </>
                    )}
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              onClick={onSave}
              disabled={mutation.isPending || uploadStatus === "uploading"}
              className="h-16 px-12 rounded-[2rem] font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Platform Identity
            </Button>
          </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">
              Interface Preview
            </h3>
          </div>

          <Card className="rounded-[3rem] border-border/40 shadow-2xl overflow-hidden bg-background h-[600px] flex flex-col relative group border-4 border-muted/50">
            {/* Header Preview */}
            <div className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-card/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Menu className="h-4 w-4 text-muted-foreground/40" />
                <div className="h-3 w-24 bg-muted rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <Search className="h-4 w-4 text-muted-foreground/20" />
                <Bell className="h-4 w-4 text-muted-foreground/20" />
                <div className="h-8 w-8 rounded-full bg-muted" />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Preview */}
              <div className="w-20 border-e border-border/40 bg-card/30 flex flex-col items-center py-8 space-y-8">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border/40">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} className="h-6 object-contain" />
                  ) : (
                    <Layout className="h-5 w-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex flex-col gap-6">
                  <div
                    className="h-10 w-10 rounded-xl shadow-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    <Layout className="h-5 w-5 text-white" />
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-muted/40" />
                  <div className="h-10 w-10 rounded-xl bg-muted/40" />
                </div>
              </div>

              {/* Content Preview */}
              <div className="flex-1 p-8 space-y-8 bg-muted/5">
                <div className="space-y-2">
                  <div
                    className="h-2 w-16 bg-primary/20 rounded-full"
                    style={{ backgroundColor: `${formData.primaryColor}33` }}
                  />
                  <h4 className="text-xl font-black uppercase tracking-tighter truncate max-w-[150px]">
                    {formData.name || "Institution"}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-3xl bg-card border border-border/40 p-4 space-y-3">
                    <div className="h-2 w-8 bg-muted rounded-full" />
                    <div
                      className="h-6 w-12 rounded-lg"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                  </div>
                  <div className="h-24 rounded-3xl bg-card border border-border/40 p-4 space-y-3">
                    <div className="h-2 w-8 bg-muted rounded-full" />
                    <div className="h-6 w-12 bg-muted/40 rounded-lg" />
                  </div>
                </div>

                <Button
                  className="w-full h-12 rounded-2xl shadow-lg transition-colors"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Action Button
                </Button>
              </div>
            </div>

            <div
              className="absolute inset-0 bg-primary/5 pointer-events-none transition-opacity group-hover:opacity-0"
              style={{ backgroundColor: `${formData.primaryColor}08` }}
            />
          </Card>

          <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-[10px] font-bold text-amber-600 leading-relaxed uppercase tracking-tighter">
              🚨 Rule: Large logo files will be automatically optimized via the TUS protocol for
              resilient performance.
            </p>
          </div>
        </div>
      </div>
    </ListView>
  );
};

export default BrandingSettingsPage;
