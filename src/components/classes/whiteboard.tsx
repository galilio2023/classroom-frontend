import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { socket } from "@/lib/socket";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Save, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";

// Lazy load Excalidraw to avoid SSR/Vite bundling issues
const Excalidraw = lazy(async () => {
  const module = await import("@excalidraw/excalidraw");
  return { default: module.Excalidraw };
});

// Helper for exporting (needs to be imported dynamically too)
let exportToBlob: any;

interface WhiteboardProps {
  classId?: string; // Optional: context for saving resources
  roomId?: string; // Explicit socket room ID. If not provided, defaults to classId.
}

export const Whiteboard = ({ classId, roomId }: WhiteboardProps) => {
  const { data: identity } = useGetIdentity<User>();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const isTeacher = identity?.role === "teacher" || identity?.role === "admin";
  const hasChangesRef = useRef<boolean>(false);

  // If roomId is not provided, fallback to classId (backward compatibility)
  const activeRoomId = roomId || classId;

  const { mutate: uploadFile } = useCustomMutation();

  useEffect(() => {
    // Load helper functions dynamically
    const loadHelpers = async () => {
      const module = await import("@excalidraw/excalidraw");
      exportToBlob = module.exportToBlob;
    };
    void loadHelpers();
  }, []);

  useEffect(() => {
    if (!activeRoomId) return;
    if (!socket.connected) socket.connect();

    console.log(`[Whiteboard] Joining room: ${activeRoomId}`);
    socket.emit("whiteboard:join", activeRoomId);

    socket.on("whiteboard:init", (data) => {
      if (excalidrawAPI && data.elements) {
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: { ...data.appState, collaborators: [] },
        });
        setIsLocked(data.isLocked);
      }
    });

    socket.on("whiteboard:update", (data) => {
      if (excalidrawAPI) {
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: { ...data.appState, collaborators: [] },
        });
      }
    });

    socket.on("whiteboard:lock-status", (data) => {
      setIsLocked(data.isLocked);
    });

    socket.on("whiteboard:clear", () => {
      if (excalidrawAPI) {
        excalidrawAPI.updateScene({ elements: [] });
      }
    });

    return () => {
      socket.off("whiteboard:init");
      socket.off("whiteboard:update");
      socket.off("whiteboard:lock-status");
      socket.off("whiteboard:clear");
    };
  }, [activeRoomId, excalidrawAPI]);

  // 🚀 AUTO-SAVE HEARTBEAT: Save to Postgres every 10 seconds if changes exist
  useEffect(() => {
    if (!activeRoomId || !isTeacher) return;

    const interval = setInterval(() => {
      if (hasChangesRef.current && excalidrawAPI) {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();

        socket.emit("whiteboard:save", {
          classId: activeRoomId,
          elements,
          appState,
        });
        hasChangesRef.current = false;
        console.log("[Whiteboard] Auto-saved to Postgres");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeRoomId, isTeacher, excalidrawAPI]);

  const onChange = useCallback(
    (elements: readonly any[], appState: any) => {
      if (!excalidrawAPI || !activeRoomId) return;

      // Only broadcast if not locked or if user is teacher
      if (isLocked && !isTeacher) return;

      hasChangesRef.current = true; // Mark for autosave

      const now = Date.now();
      if (now - lastUpdateRef.current > 100) {
        // Throttle updates
        socket.emit("whiteboard:update", {
          classId: activeRoomId, // Backend expects "classId" property for room ID
          elements,
          appState,
        });
        lastUpdateRef.current = now;
      }
    },
    [activeRoomId, excalidrawAPI, isLocked, isTeacher],
  );

  const toggleLock = () => {
    if (!activeRoomId) return;
    const newLockedState = !isLocked;
    setIsLocked(newLockedState);
    socket.emit("whiteboard:toggle-lock", {
      classId: activeRoomId,
      isLocked: newLockedState,
    });
  };

  const clearWhiteboard = () => {
    if (!activeRoomId) return;
    if (window.confirm("Are you sure you want to clear the whiteboard?")) {
      socket.emit("whiteboard:clear", activeRoomId);
    }
  };

  const saveSnapshot = async () => {
    if (!excalidrawAPI || !exportToBlob || !classId) {
      if (!classId) toast.error("Cannot save snapshot: Class context missing.");
      return;
    }
    setIsSaving(true);

    try {
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

      const file = new File(
        [blob],
        `whiteboard-${activeRoomId}-${Date.now()}.png`,
        { type: "image/png" },
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "resources");

      uploadFile(
        {
          url: "/upload",
          method: "post",
          values: formData,
          meta: {
            headers: { "Content-Type": "multipart/form-data" },
          },
        },
        {
          onSuccess: (data: any) => {
            const fileUrl = data.data.url;
            // Now create a resource entry
            uploadFile(
              {
                url: "/resources",
                method: "post",
                values: {
                  title: `Whiteboard Snapshot - ${new Date().toLocaleString()}`,
                  type: "image",
                  url: fileUrl,
                  classId: Number(classId),
                  description: `Snapshot from ${roomId ? "Group" : "Class"} Whiteboard`,
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
              },
            );
          },
          onError: () => {
            toast.error("Failed to upload image");
            setIsSaving(false);
          },
        },
      );
    } catch (error) {
      console.error("Save snapshot error:", error);
      toast.error("Failed to save snapshot");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <h4 className="text-sm font-semibold px-2">
            {roomId ? "Group Whiteboard" : "Class Whiteboard"}
          </h4>
          {isTeacher && (
            <div className="flex items-center space-x-2">
              <Switch
                id="lock-mode"
                checked={isLocked}
                onCheckedChange={toggleLock}
              />
              <Label
                htmlFor="lock-mode"
                className="text-xs flex items-center gap-1"
              >
                {isLocked ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
                {isLocked ? "Students Locked" : "Students Can Draw"}
              </Label>
            </div>
          )}
          {!isTeacher && isLocked && (
            <div className="flex items-center gap-1 text-xs text-destructive font-medium">
              <Lock className="h-3 w-3" />
              Drawing is currently disabled by teacher
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isTeacher && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearWhiteboard}
              className="h-8"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          {classId && (
            <Button
              variant="default"
              size="sm"
              onClick={saveSnapshot}
              disabled={isSaving}
              className="h-8 bg-live-primary hover:bg-live-primary/90"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save Snapshot
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 relative min-h-125">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            onChange={onChange}
            viewModeEnabled={isLocked && !isTeacher}
            theme="light"
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveAsImage: true,
                export: false,
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
};
