import { useState } from "react";
import { useCustomMutation, useNotification, BaseRecord, CreateResponse } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { AI_API } from "@/constants/api";

interface HagerExportResponse extends BaseRecord {
  url?: string;
}

/**
 * 👩‍🏫 useHagerExport Hook
 * Standardized hook for "Hager Mode" PDF generation.
 * Enforces Rule 7: Forbids client-side rendering for complex Arabic/LaTeX PDFs.
 * Offloads heavy text shaping and LaTeX compilation to the backend PDF engine.
 */
export const useHagerExport = () => {
  const { t } = useTranslation();
  const { open } = useNotification();
  const { mutate, mutation } = useCustomMutation<HagerExportResponse>();
  const [isGenerating, setIsGenerating] = useState(false);

  const isLoading = mutation.isPending;

  const exportPDF = async (options: {
    content: string;
    title: string;
    type?: "lesson" | "assignment" | "audit";
    classId?: string | number;
  }) => {
    setIsGenerating(true);

    mutate(
      {
        url: AI_API.HAGER_EXPORT, // 🚀 MANDATE: Always use backend engine for PDFs
        method: "post",
        values: {
          ...options,
          timestamp: new Date().toISOString(),
          clientMetadata: {
            viewport: window.innerWidth,
            locale: document.documentElement.lang,
          },
        },
      },
      {
        onSuccess: (data: CreateResponse<HagerExportResponse>) => {
          // 🛡️ SECURITY: Handle binary stream or signed S3/Cloudinary URL
          const downloadUrl = data.data?.url;
          if (downloadUrl) {
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `${options.title.replace(/\s+/g, "_")}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            open?.({
              type: "success",
              message: t("common.export.success", "PDF Generated Successfully"),
              description: t(
                "common.export.hagerModeReady",
                "Your high-fidelity handout is ready."
              ),
            });
          }
        },
        onError: (error) => {
          console.error("Hager Export Failed:", error);
          open?.({
            type: "error",
            message: t("common.error", "Export Failed"),
            description: t(
              "aiHub.errors.pdfEngineOffline",
              "The high-fidelity PDF engine is currently unavailable."
            ),
          });
        },
        onSettled: () => {
          setIsGenerating(false);
        },
      }
    );
  };

  return {
    exportPDF,
    isLoading: isLoading || isGenerating,
  };
};
