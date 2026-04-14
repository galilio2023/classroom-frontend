import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useSubmissionDraft = (
  assignmentId: number,
  form: UseFormReturn<any>,
  hasExistingContent: boolean
) => {
  const { t } = useTranslation();
  const draftKey = `submission:draft:${assignmentId}`;

  // 🚀 DRAFT RECOVERY
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved && !hasExistingContent) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.content) form.setValue("content", parsed.content);
        if (parsed.fileUrl) form.setValue("fileUrl", parsed.fileUrl);
        if (parsed.fileCldPubId) form.setValue("fileCldPubId", parsed.fileCldPubId);
        toast.info(t("assignments.form.toast.draftRestored"));
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, [assignmentId, hasExistingContent, form, t, draftKey]);

  const content = form.watch("content");
  const fileUrl = form.watch("fileUrl");
  const fileCldPubId = form.watch("fileCldPubId");

  // 🚀 DRAFT PERSISTENCE
  useEffect(() => {
    if (content || fileUrl) {
      localStorage.setItem(draftKey, JSON.stringify({ content, fileUrl, fileCldPubId }));
    }
  }, [content, fileUrl, fileCldPubId, draftKey]);

  const clearDraft = () => localStorage.removeItem(draftKey);

  return { clearDraft };
};
