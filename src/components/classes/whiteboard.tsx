import {
  Component,
  ErrorInfo,
  lazy,
  memo,
  ReactNode,
  Suspense,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useCustomMutation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Lock, RefreshCw, Save, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";
import { ConflictDialog } from "@/components/conflict-dialog";
import { cn } from "@/lib/utils";
import { type TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { AiFeatureGuard } from "@/components/ai/AiFeatureGuard";
import { useWhiteboardSocket } from "@/hooks/use-whiteboard-socket";
import { useUserRole } from "@/hooks/use-user-role";
import { getExportToBlob } from "@/lib/excalidraw-helpers";

// 🛡️ STRICT TYPE SAFETY: Import specific Excalidraw types
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

// Lazy load Excalidraw to avoid SSR/Vite bundling issues
const ExcalidrawLib = lazy(async () => {
  const module = await import("@excalidraw/excalidraw");
  return { default: module.Excalidraw };
});

/**
 * 🚀 PERFORMANCE: Memoized Excalidraw wrapper to prevent heavy re-renders
 * when unrelated parent states (isSaving, isDirty, etc.) change.
 */
const MemoizedExcalidraw = memo(
  ({
    onApi,
    onChange,
    viewModeEnabled,
  }: {
    onApi: (api: ExcalidrawImperativeAPI) => void;
    onChange: (elements: readonly ExcalidrawElement[], appState: AppState) => void;
    viewModeEnabled: boolean;
  }) => (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ExcalidrawLib
        excalidrawAPI={onApi}
        onChange={onChange}
        viewModeEnabled={viewModeEnabled}
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
  ),
  (prev, next) =>
    prev.viewModeEnabled === next.viewModeEnabled &&
    prev.onChange === next.onChange &&
    prev.onApi === next.onApi
);

interface WhiteboardProps {
  classId?: string; // Optional: context for saving resources
  roomId?: string; // Explicit socket room ID. If not provided, defaults to classId.
}

/**
 * 🛡️ RESILIENCE: Local Error Boundary for heavy Excalidraw component
 */
class WhiteboardErrorBoundary extends Component<
  { children: ReactNode; t: TFunction; onReset?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; t: TFunction; onReset?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 🛡️ PRODUCTION LOGGING: Monitor Excalidraw-specific crashes
    console.error("⚪ Whiteboard Component Crash:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-125 border rounded-xl bg-muted/10 gap-6 p-8">
          <div className="p-4 rounded-full bg-destructive/5 text-destructive animate-pulse">
            <AlertCircle className="h-12 w-12 opacity-50" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-black tracking-tight text-xl">
              {t("classes.live.whiteboardErrors.failed")}
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
              {t("classes.live.whiteboardErrors.refreshDesc")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center w-full">
            <Button
              onClick={this.handleReset}
              variant="default"
              className="rounded-xl font-bold uppercase tracking-widest px-8 shadow-lg shadow-primary/20"
            >
              {t("classes.live.whiteboardErrors.resetBtn", "Reset State")}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="rounded-xl font-bold uppercase tracking-widest px-8 border-primary/20 text-primary"
            >
              {t("classes.live.whiteboardErrors.refreshBtn")}
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface UploadResponse {
  url: string;
}

interface ResourceResponse {
  id: number;
}

export const Whiteboard = ({ classId, roomId }: WhiteboardProps) => {
  const { t } = useTranslation();
  const { isStaff: isTeacher, isLoading: isPermissionsLoading } = useUserRole();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isHelpersLoading, setIsHelpersLoading] = useState(false);

  // If roomId is not provided, fallback to classId (backward compatibility)
  const activeRoomId = roomId || classId;

  // 🚀 PERFORMANCE: Wrap API setter in useCallback to maintain stable reference for MemoizedExcalidraw
  const handleApi = useCallback((api: ExcalidrawImperativeAPI) => {
    setExcalidrawAPI(api);
  }, []);

  const {
    isLocked,
    isRemotePending,
    showConflict,
    setShowConflict,
    isDirty,
    setIsDirty,
    versionRef,
    triggerSave,
    handleRefresh,
    onChange,
    toggleLock,
    clearWhiteboard,
    savedTriggerSave,
    hasChangesRef,
  } = useWhiteboardSocket({
    activeRoomId,
    excalidrawAPI,
    isTeacher,
    isPermissionsLoading,
    t,
  });

  const { mutate: uploadFile } = useCustomMutation<UploadResponse>();
  const { mutate: createResource } = useCustomMutation<ResourceResponse>();

  useEffect(() => {
    if (isPermissionsLoading) return;

    // 🛡️ DATA INTEGRITY: Final flush save on page leave
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current && isTeacher) {
        // Trigger save via socket (best effort)
        savedTriggerSave.current();

        // Standard way to show confirmation dialog and prevent immediate exit
        e.preventDefault();
        return (e.returnValue = "");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isTeacher, isPermissionsLoading, hasChangesRef, savedTriggerSave]);

  if (isPermissionsLoading) {
    return (
      <div className="flex items-center justify-center h-125 border rounded-xl bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const saveSnapshot = async () => {
    if (!excalidrawAPI || !classId) {
      if (!classId) toast.error("Cannot save snapshot: Class context missing.");
      return;
    }
    setIsHelpersLoading(true);
    setIsSaving(true);

    try {
      const exportToBlob = await getExportToBlob();
      setIsHelpersLoading(false);
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
          onSuccess: (response) => {
            const fileUrl = response.data.url;
            // Now create a resource entry
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
      setIsHelpersLoading(false);
      setIsSaving(false);
    }
  };

  return (
    <AiFeatureGuard>
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
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-bold animate-pulse border border-amber-500/20">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Sync paused while you draw...</span>
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
                disabled={isSaving || isHelpersLoading}
                className={cn(
                  "h-8 transition-all",
                  isDirty
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-live-primary hover:bg-live-primary/90"
                )}
              >
                {isSaving || isHelpersLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin me-1" />
                ) : isDirty ? (
                  <AlertCircle className="h-4 w-4 me-1 animate-pulse" />
                ) : (
                  <Save className="h-4 w-4 me-1" />
                )}
                {isHelpersLoading
                  ? "Loading..."
                  : isSaving
                    ? "Saving..."
                    : isDirty
                      ? "Save Pending..."
                      : "Save Snapshot"}
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 relative min-h-125">
          <WhiteboardErrorBoundary t={t}>
            <MemoizedExcalidraw
              onApi={handleApi}
              onChange={onChange}
              viewModeEnabled={isLocked && !isTeacher}
            />
          </WhiteboardErrorBoundary>
        </div>
        <ConflictDialog
          isOpen={showConflict}
          onRefresh={handleRefresh}
          onOverwrite={() => {
            setShowConflict(false);
            setIsDirty(true);
            triggerSave(); // Force overwrite with our version
          }}
        />
      </div>
    </AiFeatureGuard>
  );
};
