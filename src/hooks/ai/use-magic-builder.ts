import { useMemo, useState, useEffect } from "react";
import { useCustomMutation, useApiUrl, useSelect } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useJobs } from "@/contexts/job-context";
import { useTerm } from "@/contexts/term-context";
import { useAiAccess } from "@/hooks/use-ai-access";
import { Class } from "@/types";

const AI_LIST_PAGE_SIZE = 50;

export type MagicBuilderLevel = "primary" | "high_school" | "university";
export type MagicBuilderTone = "academic" | "creative" | "practical";

export interface MagicBuilderConfig {
  topic: string;
  subject?: string;
  type: "package" | "note" | "quiz" | "assignment";
  level: MagicBuilderLevel;
  tone: MagicBuilderTone;
  objectives: string;
  moduleId: number | null;
}

export interface MagicBuilderJobMetadata {
  classId: number;
  progress: number;
  step: string;
}

interface UseMagicBuilderProps {
  open: boolean;
  initialConfig?: Partial<MagicBuilderConfig>;
  initialClassId?: string;
  onGenerate?: (config: MagicBuilderConfig, classId: string) => void;
  externalIsGenerating?: boolean;
}

export const useMagicBuilder = ({
  open,
  initialConfig,
  initialClassId,
  onGenerate,
  externalIsGenerating,
}: UseMagicBuilderProps) => {
  const { t } = useTranslation();
  const { isAiEnabled } = useAiAccess();
  const { jobs, addJob, updateJob } = useJobs();
  const apiUrl = useApiUrl();
  const { selectedTerm } = useTerm();
  const { mutate } = useCustomMutation();

  const [config, setConfig] = useState<MagicBuilderConfig>({
    topic: "",
    subject: "",
    type: "package",
    level: "high_school",
    tone: "academic",
    objectives: "",
    moduleId: null,
    ...initialConfig,
  });

  const [classId, setClassId] = useState(initialClassId || "");
  const [internalIsGenerating, setInternalIsGenerating] = useState(false);

  useEffect(() => {
    if (initialClassId) setClassId(initialClassId);
  }, [initialClassId]);

  const { options: classOptions, query: classQuery } = useSelect<Class>({
    resource: "classes",
    filters: selectedTerm ? [{ field: "termId", operator: "eq", value: selectedTerm.id }] : [],
    pagination: { mode: "client", pageSize: AI_LIST_PAGE_SIZE },
    queryOptions: { enabled: !initialClassId && open && isAiEnabled },
  });

  const jobId = useMemo(() => `magic-builder-${config.type}-${classId}`, [config.type, classId]);

  const activeJob = useMemo(() => {
    return jobs.find(
      (j) => j.id === jobId && (j.status === "processing" || j.status === "completed")
    );
  }, [jobs, jobId]);

  const metadata = activeJob?.metadata as MagicBuilderJobMetadata | undefined;
  const progress = metadata?.progress || 0;
  const step = metadata?.step || "";
  const isCompleted = activeJob?.status === "completed";

  const isGenerating = useMemo(() => {
    if (externalIsGenerating) return true;
    return activeJob?.status === "processing" || internalIsGenerating;
  }, [externalIsGenerating, activeJob?.status, internalIsGenerating]);

  const handleStart = async () => {
    // 🛡️ SECURITY: Sanitize and truncate inputs
    const cleanTopic = config.topic.trim().substring(0, 500);
    const cleanObjectives = config.objectives.trim().substring(0, 1000);
    
    if (!cleanTopic || !classId) {
      toast.error(t("common.errors.fillRequired"));
      return;
    }

    const initialStep = t("common.starting");

    addJob({
      id: jobId,
      type: "magic-builder",
      title: `${config.subject || "Curriculum"}: ${cleanTopic}`,
      metadata: { classId: Number(classId), progress: 0, step: initialStep },
    });

    const finalConfig = { 
      ...config, 
      topic: cleanTopic,
      objectives: cleanObjectives 
    };

    if (onGenerate) {
      onGenerate(finalConfig, classId);
    } else {
      setInternalIsGenerating(true);

      mutate(
        {
          url: `${apiUrl}/ai/magic-builder`,
          method: "post",
          values: {
            classId: Number(classId),
            ...finalConfig,
          },
        },
        {
          onSuccess: () => {
            setInternalIsGenerating(false);
          },
          onError: (error) => {
            console.error("AI Magic Builder failed:", error);
            toast.error(t("common.errors.aiFailed"));
            setInternalIsGenerating(false);
            updateJob(jobId, { status: "failed" });
          },
        }
      );
    }
  };

  const reset = () => {
    if (!activeJob || activeJob.status !== "processing") {
      setInternalIsGenerating(false);
    }
  };

  return {
    config,
    setConfig,
    classId,
    setClassId,
    classOptions,
    classQuery,
    isGenerating,
    isCompleted,
    progress,
    step,
    jobId,
    handleStart,
    reset,
  };
};
