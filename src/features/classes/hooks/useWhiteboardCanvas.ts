import { useState, useCallback, useEffect } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export const useWhiteboardCanvas = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  const handleApi = useCallback((api: ExcalidrawImperativeAPI) => {
    setExcalidrawAPI(api);
  }, []);

  useEffect(() => {
    return () => {
      setExcalidrawAPI(null);
    };
  }, []);

  return {
    excalidrawAPI,
    handleApi,
  };
};
