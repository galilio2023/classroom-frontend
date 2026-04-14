import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { getExportToBlob } from "@/lib/excalidraw-helpers";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface AnalysisResponse {
  analysis: string;
  followUpQuestions: string[];
}

interface TidyResponse {
  tidiedElements: any[];
}

export const useWhiteboardAI = (excalidrawAPI: ExcalidrawImperativeAPI | null) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTidying, setIsTidying] = useState(false);
  const [isHelpersLoading, setIsHelpersLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  const { mutate: analyzeRequest } = useCustomMutation<AnalysisResponse>();
  const { mutate: tidyRequest } = useCustomMutation<TidyResponse>();

  const tidyWithAI = async () => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    if (!elements || elements.length === 0) {
      toast.error("Whiteboard is empty.");
      return;
    }

    setIsTidying(true);
    setIsHelpersLoading(true);

    tidyRequest(
      {
        url: "/ai/whiteboard-tidy",
        method: "post",
        values: { elements },
      },
      {
        onSuccess: (response) => {
          if (response.data?.tidiedElements) {
            excalidrawAPI.updateScene({
              elements: response.data.tidiedElements,
            });
            toast.success("Whiteboard tidied by AI!");
          }
          setIsTidying(false);
          setIsHelpersLoading(false);
        },
        onError: (err) => {
          console.error("AI Tidy Error:", err);
          toast.error("AI was unable to tidy this whiteboard.");
          setIsTidying(false);
          setIsHelpersLoading(false);
        },
      }
    );
  };

  const analyzeWithAI = async () => {
    if (!excalidrawAPI) return;

    setIsHelpersLoading(true);
    setIsAnalyzing(true);

    try {
      const exportToBlob = await getExportToBlob();
      setIsHelpersLoading(false);
      const elements = excalidrawAPI.getSceneElements();

      if (!elements || elements.length === 0) {
        toast.error("Whiteboard is empty. Draw something to analyze!");
        setIsAnalyzing(false);
        return;
      }

      const blob = await exportToBlob({
        elements,
        mimeType: "image/png",
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      });

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(",")[1];

        analyzeRequest(
          {
            url: "/ai/whiteboard-analyze",
            method: "post",
            values: { image: base64data },
          },
          {
            onSuccess: (response) => {
              setAnalysisResult(response.data);
              setIsAnalyzing(false);
            },
            onError: (err) => {
              console.error("AI Analysis Error:", err);
              toast.error("AI was unable to analyze this drawing.");
              setIsAnalyzing(false);
            },
          }
        );
      };
    } catch (error) {
      console.error("Analysis preparation error:", error);
      toast.error("Failed to prepare image for analysis.");
      setIsHelpersLoading(false);
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    isTidying,
    isHelpersLoading,
    setIsHelpersLoading,
    analysisResult,
    setAnalysisResult,
    analyzeWithAI,
    tidyWithAI,
  };
};
