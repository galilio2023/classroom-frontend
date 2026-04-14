import { Component, ErrorInfo, lazy, memo, ReactNode, Suspense, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConflictDialog } from "@/components/conflict-dialog";
import { useTranslation } from "react-i18next";
import { AiFeatureGuard } from "@/features/ai/components/AiFeatureGuard";
import { useWhiteboardSocket } from "@/features/ai/hooks/use-whiteboard-socket";
import { useUserRole } from "@/hooks/use-user-role";
import { type TFunction } from "i18next";

// Hooks
import { useWhiteboardCanvas } from "@/features/classes/hooks/useWhiteboardCanvas";
import { useWhiteboardAI } from "@/features/classes/hooks/useWhiteboardAI";
import { useWhiteboardPersistence } from "@/features/classes/hooks/useWhiteboardPersistence";

// Sub-components
import { WhiteboardToolbar } from "@/features/classes/components/whiteboard/WhiteboardToolbar";
import { WhiteboardAnalysisDialog } from "@/features/classes/components/whiteboard/WhiteboardAnalysisDialog";

// STRICT TYPE SAFETY: Import specific Excalidraw types
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

// Lazy load Excalidraw to avoid SSR/Vite bundling issues
const ExcalidrawLib = lazy(async () => {
  const module = await import("@excalidraw/excalidraw");
  return { default: module.Excalidraw };
});

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
  classId?: string;
  roomId?: string;
}

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
    console.error("⚪ Whiteboard Component Crash:", error, errorInfo);
  }
  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
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

export const Whiteboard = memo(({ classId, roomId }: WhiteboardProps) => {
  const { t } = useTranslation();
  const { isStaff: isTeacher, isLoading: isPermissionsLoading } = useUserRole();
  const activeRoomId = roomId || classId;

  const { excalidrawAPI, handleApi } = useWhiteboardCanvas();

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

  const {
    isAnalyzing,
    isHelpersLoading,
    setIsHelpersLoading,
    analysisResult,
    setAnalysisResult,
    analyzeWithAI,
  } = useWhiteboardAI(excalidrawAPI);

  const { isSaving, saveSnapshot } = useWhiteboardPersistence(
    excalidrawAPI,
    classId,
    roomId,
    versionRef,
    setIsHelpersLoading
  );

  useEffect(() => {
    if (isPermissionsLoading) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current && isTeacher) {
        savedTriggerSave.current();
        e.preventDefault();
        return (e.returnValue = "");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isTeacher, isPermissionsLoading, hasChangesRef, savedTriggerSave]);

  if (isPermissionsLoading) {
    return (
      <div className="flex items-center justify-center h-125 border rounded-xl bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AiFeatureGuard>
      <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
        <WhiteboardToolbar
          roomId={roomId}
          isTeacher={isTeacher}
          isLocked={isLocked}
          onToggleLock={toggleLock}
          isRemotePending={isRemotePending}
          isAnalyzing={isAnalyzing}
          isHelpersLoading={isHelpersLoading}
          onAnalyze={analyzeWithAI}
          onClear={clearWhiteboard}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={saveSnapshot}
          classId={classId}
        />
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
            triggerSave();
          }}
        />
        <WhiteboardAnalysisDialog
          analysisResult={analysisResult}
          onClose={() => setAnalysisResult(null)}
        />
      </div>
    </AiFeatureGuard>
  );
});
