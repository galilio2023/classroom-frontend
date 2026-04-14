import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { getExportToBlob } from "@/lib/excalidraw-helpers";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface UploadResponse {
  url: string;
}

interface ResourceResponse {
  id: number;
}

export const useWhiteboardPersistence = (
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  classId?: string,
  roomId?: string,
  versionRef?: React.MutableRefObject<number>,
  onLoadingChange?: (loading: boolean) => void
) => {
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: uploadFile } = useCustomMutation<UploadResponse>();
  const { mutate: createResource } = useCustomMutation<ResourceResponse>();

  const saveSnapshot = async () => {
    if (!excalidrawAPI || !classId) {
      if (!classId) toast.error("Cannot save snapshot: Class context missing.");
      return;
    }
    onLoadingChange?.(true);
    setIsSaving(true);

    try {
      const exportToBlob = await getExportToBlob();
      onLoadingChange?.(false);
      const elements = excalidrawAPI.getSceneElements();
      if (!elements || elements.length === 0) {
        toast.error("Whiteboard is empty");
        setIsSaving(false);
        return;
      }

      const blob = await exportToBlob({
        elements,
        mimeType: "image/png",
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      });

      const file = new File([blob], `whiteboard-${roomId || classId}-${Date.now()}.png`, {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "resources");

      uploadFile(
        {
          url: "/upload",
          method: "post",
          values: formData,
          meta: { headers: { "Content-Type": "multipart/form-data" } },
        },
        {
          onSuccess: (response) => {
            const fileUrl = response.data.url;
            createResource(
              {
                url: "/resources",
                method: "post",
                values: {
                  title: `Whiteboard Snapshot - ${new Date().toLocaleString()}`,
                  type: "image",
                  url: fileUrl,
                  classId: Number(classId),
                  description: `Snapshot from ${roomId ? "Group" : "Class"} Whiteboard`,
                  version: versionRef?.current || 1,
                },
              },
              {
                onSuccess: () => {
                  toast.success("Whiteboard snapshot saved to resources");
                  setIsSaving(false);
                },
                onError: () => {
                  toast.error("Failed to save resource entry");
                  setIsSaving(false);
                },
              }
            );
          },
          onError: () => {
            toast.error("Failed to upload image");
            setIsSaving(false);
          },
        }
      );
    } catch (error) {
      console.error("Save snapshot error:", error);
      toast.error("Failed to save snapshot");
      onLoadingChange?.(false);
      setIsSaving(false);
    }
  };

  return { isSaving, saveSnapshot };
};
