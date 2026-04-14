import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { getExportToBlob } from "@/lib/excalidraw-helpers";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface AnalysisResponse {
  analysis: string;
  followUpQuestions: string[];
}

export const useWhiteboardAI = (excalidrawAPI: ExcalidrawImperativeAPI | null) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHelpersLoading, setIsHelpersLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  const { mutate: analyzeRequest } = useCustomMutation<AnalysisResponse>();

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
    isHelpersLoading,
    setIsHelpersLoading,
    analysisResult,
    setAnalysisResult,
    analyzeWithAI,
  };
};
