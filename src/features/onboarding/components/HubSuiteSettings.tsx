import React from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Building2,
  Library,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowUpCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const HubSuiteSettings: React.FC = () => {
  const { t } = useTranslation();
  const { suiteType, identity } = useCapabilities();
  const { refetch: refetchIdentity } = useGetIdentity<User>();

  const { data: previewData, isLoading: isPreviewLoading } = useCustom({
    url: `${import.meta.env.VITE_API_URL}/suite/upgrade-preview`,
    method: "get",
  }) as any;

  const { mutate: upgradeSuite, mutation: upgradeMutation } = useCustomMutation() as any;
  const isUpgrading = upgradeMutation.isPending;

  const handleUpgrade = () => {
    upgradeSuite({
      url: `${import.meta.env.VITE_API_URL}/suite/upgrade`,
      method: "post",
      values: {},
      config: {},
      onSuccess: () => {
        toast.success(t("settings.hub.upgradeSuccess", "Organization successfully upgraded!"));
        refetchIdentity();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Upgrade failed.");
      },
    });
  };

  const nextSuite = (previewData?.data as any)?.nextSuite;

  const suiteIcons = {
    private: Sparkles,
    school: Building2,
    faculty: Library,
    corporate: ShieldCheck,
  };

  const NextIcon = nextSuite ? suiteIcons[nextSuite as keyof typeof suiteIcons] : Zap;

  return (
    <Card className="border-border/40 shadow-xl shadow-primary/5 rounded-4xl overflow-hidden bg-gradient-to-br from-card to-muted/5">
      <CardHeader className="pb-8 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black">
              {t("settings.hub.title", "Platform Suite Upgrade")}
            </CardTitle>
            <CardDescription>
              {t("settings.hub.description", "Current Suite")}:{" "}
              <Badge variant="outline" className="ml-2 uppercase tracking-widest">
                {suiteType}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 space-y-8">
        {!nextSuite ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black">
                {t("settings.hub.maxLevel", "Maximum Suite Reached")}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "settings.hub.maxLevelDesc",
                  "You are already using the most comprehensive version of Tablawy OS."
                )}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                    {t("settings.hub.upgradeTitle", "Available Upgrade")}
                  </h3>
                  <div className="flex items-center gap-4 text-3xl font-black">
                    <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10">
                      <NextIcon className="w-8 h-8" />
                    </div>
                    <span className="capitalize">{nextSuite} Suite</span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    `settings.hub.upgradeDesc.${nextSuite}` as any,
                    "Unlock advanced institutional tools and multi-tenant management features."
                  )}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-muted/50 border border-border/40 space-y-4">
                <h4 className="font-black uppercase tracking-widest text-xs text-muted-foreground">
                  {t("settings.hub.whatsIncluded", "What's Included")}
                </h4>
                <ul className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {t(
                        `settings.hub.feature.${nextSuite}.${i}` as any,
                        "Advanced Analytics & Reporting"
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40">
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
              >
                {isUpgrading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {t("settings.hub.upgradeAction", "Upgrade My Organization Now")}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
