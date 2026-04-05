import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { ErrorCode } from "@/constants/error-codes";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFiles,
  Collaborator,
  SocketId,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

interface WhiteboardSaveResponse {
  success: boolean;
  version?: number;
  error?: string;
}

interface UseWhiteboardSocketProps {
  activeRoomId: string | undefined;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  isTeacher: boolean;
  isPermissionsLoading: boolean;
  t: any;
}

export const useWhiteboardSocket = ({
  activeRoomId,
  excalidrawAPI,
  isTeacher,
  isPermissionsLoading,
  t,
}: UseWhiteboardSocketProps) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isRemotePending, setIsRemotePending] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const lastUpdateRef = useRef<number>(0);
  const versionRef = useRef<number>(1);
  const isSavingRef = useRef<boolean>(false);
  const hasChangesRef = useRef<boolean>(false);
  const isMounted = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    abortControllerRef.current = new AbortController();
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 🛡️ SOCKET SAFETY: Reset saving state on disconnect to prevent UI locks
  useEffect(() => {
    const handleDisconnect = () => {
      if (isSavingRef.current) {
        console.warn("[Whiteboard] Socket disconnected during save. Resetting lock.");
        isSavingRef.current = false;
      }
    };
    socket.on("disconnect", handleDisconnect);
    return () => {
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!activeRoomId || isPermissionsLoading) return;
    if (!socket.connected) socket.connect();

    console.log(`[Whiteboard] Joining room: ${activeRoomId}`);
    socket.emit("whiteboard:join", activeRoomId);

    const handleInit = (data: {
      elements: ExcalidrawElement[];
      appState: Partial<AppState>;
      isLocked: boolean;
      version?: number;
    }) => {
      if (excalidrawAPI && data.elements) {
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: {
            ...(data.appState as Partial<AppState>),
            collaborators: new Map(),
          } as any,
        });
        setIsLocked(data.isLocked);

        if (data.version) {
          versionRef.current = data.version;
          console.log(`[Whiteboard] Initialized at version: ${data.version}`);
        }
      }
    };

    const handleUpdate = (data: {
      elements: ExcalidrawElement[];
      appState: Partial<AppState>;
      version?: number;
    }) => {
      if (excalidrawAPI) {
        const currentAppState = excalidrawAPI.getAppState();
        const isInteracting =
          currentAppState.isResizing ||
          currentAppState.isRotating ||
          currentAppState.selectedElementsAreBeingDragged ||
          currentAppState.editingTextElement !== null ||
          currentAppState.newElement !== null ||
          currentAppState.multiElement !== null ||
          currentAppState.editingLinearElement !== null;

        if (isInteracting) {
          console.log("[Whiteboard] Remote update skipped: User is interacting with canvas.");
          setIsRemotePending(true);
          return;
        }

        setIsRemotePending(false);
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: {
            ...(data.appState as Partial<AppState>),
            collaborators: new Map(),
          } as any,
        });

        if (data.version) {
          versionRef.current = data.version;
        }
      }
    };

    const handleLockStatus = (data: { isLocked: boolean }) => {
      // 🛡️ LIFECYCLE SAFETY: Ignore if hook is aborted
      if (abortControllerRef.current?.signal.aborted) return;

      setIsLocked(data.isLocked);
      if (!isTeacher) {
        toast.info(
          data.isLocked
            ? t("classes.live.whiteboard.locked")
            : t("classes.live.whiteboard.unlocked")
        );
      }
    };

    const handleClear = () => {
      // 🛡️ LIFECYCLE SAFETY: Ignore if hook is aborted
      if (abortControllerRef.current?.signal.aborted) return;

      if (excalidrawAPI) {
        excalidrawAPI.updateScene({ elements: [] });
        if (!isTeacher) toast.warning(t("classes.live.whiteboard.cleared"));
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
  }, [activeRoomId, excalidrawAPI, isTeacher, isPermissionsLoading, t]);

  const triggerSave = useCallback(() => {
    const canSave =
      hasChangesRef.current && !isSavingRef.current && excalidrawAPI && activeRoomId && isTeacher;

    if (canSave) {
      if (!socket.connected) {
        toast.error(t("classes.live.whiteboardErrors.connectionLost"));
        return;
      }

      if (!isMounted.current) return;

      isSavingRef.current = true;

      const saveTimeout = setTimeout(() => {
        if (isSavingRef.current) {
          isSavingRef.current = false;
          if (isMounted.current) {
            toast.error(t("classes.live.whiteboardErrors.saveTimeout"));
          }
        }
      }, 8000);

      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
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
          isSavingRef.current = false;

          // 🛡️ LIFECYCLE SAFETY: Ignore response if hook is aborted or unmounted
          if (abortControllerRef.current?.signal.aborted || !isMounted.current) return;

          if (res.success && res.version) {
            versionRef.current = res.version;
            hasChangesRef.current = false;
            setIsDirty(false);
          } else if (res.error === "CONFLICT" || res.error === ErrorCode.STALE_VERSION_CONFLICT) {
            setShowConflict(true);
            if (res.version) versionRef.current = res.version;
          }
        }
      );
    }
  }, [excalidrawAPI, activeRoomId, isTeacher, t]);

  const handleRefresh = () => {
    if (!activeRoomId) return;
    setShowConflict(false);
    isSavingRef.current = false;
    socket.emit("whiteboard:join", activeRoomId);
    hasChangesRef.current = false;
    setIsDirty(false);
  };

  const savedTriggerSave = useRef(triggerSave);
  useEffect(() => {
    savedTriggerSave.current = triggerSave;
  }, [triggerSave]);

  useEffect(() => {
    if (!activeRoomId || !isTeacher) return;

    const interval = setInterval(() => {
      if (hasChangesRef.current) {
        savedTriggerSave.current();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      if (hasChangesRef.current && socket.connected && isMounted.current) {
        savedTriggerSave.current();
      }
    };
  }, [activeRoomId, isTeacher]);

  const onChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState) => {
      if (!excalidrawAPI || !activeRoomId) return;

      if (isLocked && !isTeacher) return;

      if (!hasChangesRef.current) {
        hasChangesRef.current = true;
        setIsDirty(true);
      }

      const now = Date.now();
      if (now - lastUpdateRef.current > 150) {
        socket.emit("whiteboard:update", {
          classId: activeRoomId,
          elements,
          appState,
          version: versionRef.current,
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
    if (window.confirm(t("classes.live.whiteboard.clearConfirm"))) {
      socket.emit("whiteboard:clear", activeRoomId);
    }
  };

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isLocked,
    isRemotePending,
    showConflict,
    setShowConflict,
    isDirty,
    setIsDirty,
    versionRef,
    isSavingRef,
    hasChangesRef,
    triggerSave,
    handleRefresh,
    onChange,
    toggleLock,
    clearWhiteboard,
    savedTriggerSave,
    abort,
  };
};
