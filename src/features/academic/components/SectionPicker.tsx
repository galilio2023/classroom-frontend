import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Layers,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useList, useCustomMutation, useGo } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { useNotifyError } from "@/hooks/use-notify-error";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useSchoolTheme } from "@/contexts/school-theme-context";
import { toast } from "sonner";
import { QUERY_SETTINGS } from "@/constants/api";
import { offlineDB } from "@/lib/offline-db";
import { SectionCard, type Section } from "./section-card";

interface SectionSelectionResponse {
  success: boolean;
  offline?: boolean;
  data?: Record<string, any>;
}

interface SectionPickerProps {
  enrollmentId: string;
  onSuccess?: () => void;
}

export const SectionPicker: React.FC<SectionPickerProps> = ({ enrollmentId, onSuccess }) => {
  const { t } = useTranslation();
  const go = useGo();
  const { notifyError } = useNotifyError();
  const isOnline = useOnlineStatus();
  const { primaryColor } = useSchoolTheme();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // 🛡️ RULE 4 (Offline-First): Use useList to leverage Refine's internal cache (Dexie/IndexedDB)
  // This ensures the student can see available sections even without internet.
  const { query, result } = useList<Section>({
    resource: "timetable/available-sections",
    filters: [
      {
        field: "enrollmentId",
        operator: "eq",
        value: enrollmentId,
      },
    ],
    queryOptions: {
      staleTime: QUERY_SETTINGS.STALE_TIME_HIGH_STAKES, // 🛡️ HUB HARDENING: High-traffic enrollment (Review #15)
      gcTime: QUERY_SETTINGS.CACHE_TIME_PERSISTENT,
    },
  });

  const sections = result?.data || [];
  const isLoading = query.isLoading;
  const refetch = query.refetch;

  const { mutate, mutation } = useCustomMutation<SectionSelectionResponse>();
  const isUpdating = mutation.isPending;

  const handleConfirm = async () => {
    if (!selectedClassId) return;

    if (!isOnline) {
      // 🛡️ RULE 4 (Rural Hardening): Queue mutation for background sync
      await offlineDB.queue({
        resource: "timetable/enrollment/select-section",
        action: "custom",
        variables: { enrollmentId, classId: selectedClassId },
        meta: { method: "patch" },
      });

      toast.success(
        t(
          "status.offline_save_success",
          "Selection saved offline. It will sync when you are back online."
        )
      );
      onSuccess?.();
      go({ to: { resource: "dashboard", action: "list" } });
      return;
    }

    mutate(
      {
        url: `timetable/enrollment/${enrollmentId}/select-section`,
        method: "patch", // 🛡️ Backend uses PATCH for this route
        values: { classId: selectedClassId },
      },
      {
        onSuccess: (response) => {
          // Refine mutation response wraps the payload in .data
          const isOfflineResult = response?.data?.offline;
          if (!isOfflineResult) {
            toast.success(
              t("timetable.section_picker.success", "Lecture section selected successfully!")
            );
          }
          onSuccess?.();
          // 🚀 Programmatic navigation to dashboard using resource-based pattern (Review #15)
          go({ to: { resource: "dashboard", action: "list" } });
        },
        onError: async (err: unknown) => {
          // 🚀 RULE 8: Surface Trace ID for high-stakes errors via centralized hook
          notifyError(err);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8 text-start">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-3xl border-border/40 overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24 rounded-2xl" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-start">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5" style={{ color: primaryColor }} />
          {t("timetable.section_picker.title", "Choose Your Section")}
          {!isOnline && (
            <Badge
              variant="destructive"
              className="ml-3 rounded-full h-5 px-2 font-black uppercase gap-1 animate-pulse shadow-lg shadow-destructive/20 text-[8px]"
            >
              <WifiOff className="w-3 h-3" />
              {t("status.offline", "Offline Mode")}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full ms-auto"
            onClick={() => refetch()}
            disabled={!isOnline || isLoading}
          >
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
          </Button>
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          {t(
            "timetable.section_picker.description",
            "Select a preferred timeframe and location for your lectures."
          )}
        </p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {sections.length > 0 ? (
            sections.map((section: Section, idx: number) => (
              <SectionCard
                key={section.id}
                section={section}
                idx={idx}
                isSelected={selectedClassId === section.classId}
                primaryColor={primaryColor}
                onSelect={setSelectedClassId}
                t={t}
              />
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-muted/5 rounded-[2.5rem] border border-dashed border-border/60">
              <div className="p-4 rounded-full bg-muted/10">
                <Layers className="w-12 h-12 text-muted-foreground/20" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black uppercase tracking-tight">
                  {t("timetable.section_picker.empty_title", "No Sections Available")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {t(
                    "timetable.section_picker.empty_description",
                    "This course currently has no active lecture slots. Please contact the registrar."
                  )}
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
        <Button
          onClick={handleConfirm}
          disabled={!selectedClassId || isUpdating}
          className={cn(
            "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-xl transition-all",
            !isOnline ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" : "shadow-primary/20"
          )}
          style={{
            backgroundColor: isOnline ? primaryColor : undefined,
          }}
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("common.saving", "Saving...")}
            </>
          ) : !isOnline ? (
            <>
              <WifiOff className="w-4 h-4" />
              {t("status.offline_queue", "Save Offline")}
            </>
          ) : (
            <>
              {t("timetable.section_picker.confirm", "Confirm Selection")}
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
