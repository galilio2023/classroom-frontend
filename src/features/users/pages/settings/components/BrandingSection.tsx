import React from "react";
import { useTranslation } from "react-i18next";
import { useGetIdentity, useCustomMutation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { User } from "@/types";
import { useTusUpload } from "@/hooks/use-tus-upload";
import { handleError } from "@/providers/utils/api-errors";
import { cn } from "@/lib/utils";

export const BrandingSection: React.FC = () => {
  const { t } = useTranslation();
  const { data: identity, refetch: refetchIdentity } = useGetIdentity<User>();
  const { mutate: updateBranding, mutation } = useCustomMutation();
  const { startUpload, progress, status: uploadStatus, uploadUrl } = useTusUpload();

  const [formData, setFormData] = React.useState({
    name: identity?.schoolName || "",
    primaryColor: identity?.brandingConfig?.primaryColor || "#4f46e5",
    logoUrl: identity?.brandingConfig?.logoUrl || "",
  });

  React.useEffect(() => {
    if (identity) {
      setFormData({
        name: identity.schoolName || "",
        primaryColor: identity.brandingConfig?.primaryColor || "#4f46e5",
        logoUrl: identity.brandingConfig?.logoUrl || "",
      });
    }
  }, [identity]);

  React.useEffect(() => {
    if (uploadStatus === "success" && uploadUrl) {
      setFormData((prev) => ({ ...prev, logoUrl: uploadUrl }));
      toast.success(t("schools.branding.logoUploaded", "Logo uploaded successfully."));
    }
  }, [uploadStatus, uploadUrl, t]);

  const handleInputChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startUpload(file, null);
    }
  };

  const onSave = () => {
    updateBranding(
      {
        url: `${import.meta.env.VITE_API_URL}/schools/branding`,
        method: "patch",
        values: {
          name: formData.name,
          brandingConfig: {
            primaryColor: formData.primaryColor,
            logoUrl: formData.logoUrl,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(t("schools.branding.success", "Identity updated successfully."));
          refetchIdentity();
          // Immediate CSS update for UX
          document.documentElement.style.setProperty("--primary", formData.primaryColor);
        },
        onError: async (err) => {
          const httpError = await handleError(err);
          toast.error(httpError.message);
        },
      }
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-3 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl">
          <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">
                {t("schools.branding.form.identityTitle", "Institutional Name")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-3 text-start">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">
                {t("schools.branding.form.displayName", "Display Name")}
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

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl">
            <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                  <Paintbrush className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  {t("schools.branding.form.visualTheme", "Visual Theme")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4 text-start">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("schools.branding.form.primaryPalette", "Primary Palette")}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div
                      className="h-16 w-16 rounded-2xl shadow-2xl border-4 border-background cursor-pointer overflow-hidden transition-transform group-hover:scale-105"
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

          <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-3xl">
            <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500 text-white">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  {t("schools.branding.form.logo", "Institution Logo")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-start">
              <div className="relative">
                <input
                  type="file"
                  id="branding-logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <Label
                  htmlFor="branding-logo-upload"
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
                        {t("schools.branding.form.uploadLogo", "Upload SVG/PNG")}
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
            {t("buttons.savePlatformIdentity", "Save Platform Identity")}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">
            {t("schools.branding.preview.title", "Interface Preview")}
          </h3>
        </div>

        <Card className="rounded-[3rem] border-border/40 shadow-2xl overflow-hidden bg-background h-[550px] flex flex-col relative group border-4 border-muted/50 scale-[0.98] origin-top">
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
            <div className="w-20 border-e border-border/40 bg-card/30 flex flex-col items-center py-8 space-y-8">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border/40">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="h-6 object-contain" />
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
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8 bg-muted/5">
              <div className="space-y-2">
                <div
                  className="h-2 w-16 rounded-full"
                  style={{ backgroundColor: `${formData.primaryColor}33` }}
                />
                <h4 className="text-xl font-black uppercase tracking-tighter truncate max-w-[150px]">
                  {formData.name || t("common.institution", "Institution")}
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
                className="w-full h-12 rounded-2xl shadow-lg pointer-events-none"
                style={{ backgroundColor: formData.primaryColor }}
              >
                {t("buttons.action", "Action Button")}
              </Button>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-primary/5 pointer-events-none"
            style={{ backgroundColor: `${formData.primaryColor}08` }}
          />
        </Card>

        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-[10px] font-bold text-amber-600 leading-relaxed uppercase tracking-tighter">
            {t(
              "schools.branding.rule.tus",
              "🚨 Rule: Large logo files optimized via TUS protocol for rural performance."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
