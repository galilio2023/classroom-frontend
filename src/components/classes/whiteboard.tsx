import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  Component,
  ReactNode,
} from "react";
import { socket } from "@/lib/socket";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Save, Trash2, Unlock, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConflictDialog } from "@/components/conflict-dialog";
import { ErrorCode } from "@/constants/error-codes";
import { cn } from "@/lib/utils";

// Lazy load Excalidraw to avoid SSR/Vite bundling issues
const Excalidraw = lazy(async () => {
  const module = await import("@excalidraw/excalidraw");
  return { default: module.Excalidraw };
});

// Helper for exporting (needs to be imported dynamically too)
let exportToBlob: any;

/**
 * 🛡️ TYPE SAFETY: Minimal interface for Excalidraw API
 * Replacing 'any' with 'unknown' where specific library types aren't critical
 */
interface ExcalidrawAPI {
  updateScene: (data: {
    elements?: readonly any[];
    appState?: any;
    collaborators?: Map<string, any>;
    commitToHistory?: boolean;
  }) => void;
  getSceneElements: () => readonly any[];
  getAppState: () => any;
  getFiles: () => any;
}

interface WhiteboardSaveResponse {
  success: boolean;
  version?: number;
  error?: string;
}

interface WhiteboardProps {
  classId?: string; // Optional: context for saving resources
  roomId?: string; // Explicit socket room ID. If not provided, defaults to classId.
}

/**
 * 🛡️ RESILIENCE: Local Error Boundary for heavy Excalidraw component
 */
class WhiteboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-125 border rounded-xl bg-muted/10 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
          <div className="text-center">
            <h3 className="font-black tracking-tight">Whiteboard failed to load</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Please refresh the page to try again.
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="rounded-xl font-bold uppercase tracking-widest"
          >
            Refresh Now
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Whiteboard = ({ classId, roomId }: WhiteboardProps) => {
  const { data: identity } = useGetIdentity<User>();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemotePending, setIsRemotePending] = useState(false); // 🛡️ UI: Indicator for blocked updates
  const [showConflict, setShowConflict] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // 🛡️ SEMANTIC STATE: Replaces forceUpdate
  const lastUpdateRef = useRef<number>(0);
  const versionRef = useRef<number>(1); // 🛡️ OPTIMISTIC LOCKING VERSION
  const isSavingRef = useRef<boolean>(false); // 🛡️ IN-FLIGHT SAVE TRACKER
  const isTeacher = identity?.role === "teacher" || identity?.role === "admin";
  const hasChangesRef = useRef<boolean>(false);
  const isMounted = useRef<boolean>(true); // 🛡️ MOUNT CHECK

  // If roomId is not provided, fallback to classId (backward compatibility)
  const activeRoomId = roomId || classId;

  const { mutate: uploadFile } = useCustomMutation();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Load helper functions dynamically
    const loadHelpers = async () => {
      try {
        const module = await import("@excalidraw/excalidraw");
        exportToBlob = module.exportToBlob;
      } catch (err) {
        console.error("Failed to load Excalidraw helpers", err);
      }
    };
    void loadHelpers();
  }, []);

  useEffect(() => {
    if (!activeRoomId) return;
    if (!socket.connected) socket.connect();

    console.log(`[Whiteboard] Joining room: ${activeRoomId}`);
    socket.emit("whiteboard:join", activeRoomId);

    const handleInit = (data: any) => {
      if (excalidrawAPI && data.elements) {
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: { ...(data.appState as any), collaborators: [] },
        });
        setIsLocked(data.isLocked);

        // 🛡️ SYNC VERSION
        if (data.version) {
          versionRef.current = data.version;
          console.log(`[Whiteboard] Initialized at version: ${data.version}`);
        }
      }
    };

    const handleUpdate = (data: any) => {
      if (excalidrawAPI) {
        // 🛡️ INTERACTION GUARD: Don't overwrite if user is currently drawing/editing
        const currentAppState = excalidrawAPI.getAppState();
        const isInteracting =
          currentAppState.isResizing ||
          currentAppState.isRotating ||
          currentAppState.draggingElement ||
          currentAppState.editingElement ||
          currentAppState.multiElement;

        if (isInteracting) {
          console.log("[Whiteboard] Remote update skipped: User is interacting with canvas.");
          setIsRemotePending(true); // 🛡️ Alert user that remote changes are waiting
          return;
        }

        setIsRemotePending(false); // Clear alert on successful sync
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: { ...(data.appState as any), collaborators: [] },
        });

        // 🛡️ SYNC VERSION ON UPDATE
        if (data.version) {
          versionRef.current = data.version;
        }
      }
    };

    const handleLockStatus = (data: { isLocked: boolean }) => {
      setIsLocked(data.isLocked);
      if (!isTeacher) {
        toast.info(
          data.isLocked ? "Teacher has locked the board" : "Teacher has unlocked the board"
        );
      }
    };

    const handleClear = () => {
      if (excalidrawAPI) {
        excalidrawAPI.updateScene({ elements: [] });
        if (!isTeacher) toast.warning("The teacher has cleared the whiteboard");
      }
    };

    socket.on("whiteboard:init", handleInit);
    socket.on("whiteboard:update", handleUpdate);
    socket.on("whiteboard:lock-status", handleLockStatus);
    socket.on("whiteboard:clear", handleClear);

    return () => {
      socket.off("whiteboard:init", handleInit);
      socket.off("whiteboard:update", handleUpdate);
      socket.off("whiteboard:lock-status", handleLockStatus);
      socket.off("whiteboard:clear", handleClear);
    };
  }, [activeRoomId, excalidrawAPI, isTeacher]);

  // 🚀 MANUAL SAVE FUNCTION
  const triggerSave = useCallback(() => {
    // 🛡️ RESILIENCE: Ensure socket is connected and state is dirty before emitting
    const canSave =
      hasChangesRef.current && !isSavingRef.current && excalidrawAPI && activeRoomId && isTeacher;

    if (canSave) {
      if (!socket.connected) {
        toast.error("Cloud sync paused: Connection lost. Reconnecting...");
        return;
      }

      if (!isMounted.current) return;

      isSavingRef.current = true;

      // 🛡️ TIMEOUT FALLBACK: Prevent UI from getting stuck if server doesn't respond
      const saveTimeout = setTimeout(() => {
        if (isSavingRef.current) {
          isSavingRef.current = false;
          if (isMounted.current) {
            toast.error("Cloud sync timeout: No response from server. Will retry later.");
          }
        }
      }, 8000); // 8 seconds

      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();

      // 🛡️ ANCESTRY CHECK: Send current version to backend
      const currentVersion = versionRef.current;

      socket.emit(
        "whiteboard:save",
        {
          classId: activeRoomId,
          elements,
          appState,
          version: currentVersion,
        },
        (res: WhiteboardSaveResponse) => {
          clearTimeout(saveTimeout);
          isSavingRef.current = false; // 🛡️ CRITICAL: Always reset ref even if unmounted

          if (!isMounted.current) return; // 🛡️ PREVENT MEMORY LEAK for setState

          if (res.success && res.version) {
            versionRef.current = res.version;
            hasChangesRef.current = false; // 🛡️ RESET ONLY ON CONFIRMED SUCCESS
            setIsDirty(false);
          } else if (res.error === "CONFLICT" || res.error === ErrorCode.STALE_VERSION_CONFLICT) {
            setShowConflict(true);
            if (res.version) versionRef.current = res.version;
            // Note: hasChanges stays true to prevent data loss until refresh
          }
        }
      );
    }
  }, [excalidrawAPI, activeRoomId, isTeacher]);

  const handleRefresh = () => {
    if (!activeRoomId) return;
    setShowConflict(false);
    socket.emit("whiteboard:join", activeRoomId); // Re-fetch latest state
    hasChangesRef.current = false;
    setIsDirty(false);
  };

  // 🚀 AUTO-SAVE HEARTBEAT: Save to Postgres every 10 seconds if changes exist
  useEffect(() => {
    if (!activeRoomId || !isTeacher) return;

    const interval = setInterval(() => {
      if (hasChangesRef.current) {
        triggerSave();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      // 🛡️ UNMOUNT SAFETY: Flush only if dirty, socket is active, and still mounted
      if (hasChangesRef.current && socket.connected && isMounted.current) {
        triggerSave();
      }
    };
  }, [activeRoomId, isTeacher, triggerSave]);

  const onChange = useCallback(
    (elements: readonly any[], appState: any) => {
      if (!excalidrawAPI || !activeRoomId) return;

      // Only broadcast if not locked or if user is teacher
      if (isLocked && !isTeacher) return;

      if (!hasChangesRef.current) {
        hasChangesRef.current = true; // Mark for autosave
        setIsDirty(true); // Show pending status
      }

      const now = Date.now();
      if (now - lastUpdateRef.current > 150) {
        // 🚀 THROTTLE: Increased to 150ms for performance stability
        socket.emit("whiteboard:update", {
          classId: activeRoomId, // Backend expects "classId" property for room ID
          elements,
          appState,
          version: versionRef.current, // 🔗 Attach current version to broadcast
        });
        lastUpdateRef.current = now;
      }
    },
    [activeRoomId, excalidrawAPI, isLocked, isTeacher]
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

      const file = new File([blob], `whiteboard-${activeRoomId}-${Date.now()}.png`, {
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
                  version: versionRef.current, // 🛡️ CAPTURE ACCURATE VERSION
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
      setIsSaving(false);
    }
  };

  return (
    <WhiteboardErrorBoundary>
      <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
          <div className="flex items-center gap-4">
            <h4 className="text-sm font-semibold px-2">
              {roomId ? "Group Whiteboard" : "Class Whiteboard"}
            </h4>
            {isTeacher && (
              <div className="flex items-center space-x-2">
                <Switch id="lock-mode" checked={isLocked} onCheckedChange={toggleLock} />
                <Label htmlFor="lock-mode" className="text-xs flex items-center gap-1">
                  {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
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
            {isRemotePending && (
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Remote updates waiting... (Release drawing to sync)
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isTeacher && (
              <Button variant="outline" size="sm" onClick={clearWhiteboard} className="h-8">
                <Trash2 className="h-4 w-4 me-1" />
                Clear
              </Button>
            )}
            {classId && (
              <Button
                variant="default"
                size="sm"
                onClick={saveSnapshot}
                disabled={isSaving}
                className={cn(
                  "h-8 transition-all",
                  isDirty
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-live-primary hover:bg-live-primary/90"
                )}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin me-1" />
                ) : isDirty ? (
                  <AlertCircle className="h-4 w-4 me-1 animate-pulse" />
                ) : (
                  <Save className="h-4 w-4 me-1" />
                )}
                {isDirty ? "Save Pending..." : "Save Snapshot"}
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
              excalidrawAPI={(api) => setExcalidrawAPI(api as any as ExcalidrawAPI)}
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
        <ConflictDialog
          isOpen={showConflict}
          onRefresh={handleRefresh}
          onOverwrite={() => {
            setShowConflict(false);
            hasChangesRef.current = true;
            setIsDirty(true);
            triggerSave(); // Force overwrite with our version
          }}
        />
      </div>
    </WhiteboardErrorBoundary>
  );
};
