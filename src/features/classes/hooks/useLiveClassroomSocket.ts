import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useTranslation } from "react-i18next";

export interface LiveInitPayload {
  classId: number;
  isAiDelegated: boolean;
  isBreakoutActive: boolean;
  aiPhoto?: string | null;
  currentScript?: string | null;
  visualCue?: "talking" | "thinking" | "listening" | "idle";
}

export interface TeacherResumedPayload {
  classId: string;
  reason?: "ai_degraded" | "manual";
}

interface SocketHandlers {
  onSessionStarted: (data: { classId: number; startedBy: string }) => void;
  onSessionEnded: (data: { classId: number }) => void;
  onBreakoutStarted: (data: any) => void;
  onBreakoutEnded: (data: { classId: number }) => void;
  onTeacherDelegated: (data: { classId: number }) => void;
  onTeacherResumed: (data: TeacherResumedPayload) => void;
  onPulseUpdate: (data: { classId: number; count: number }) => void;
  onLiveInit?: (data: LiveInitPayload) => void;
}

export const useLiveClassroomSocket = (numericClassId: number, handlers: SocketHandlers) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const wrappedHandlers = {
      sessionStarted: (data: { classId: number; startedBy: string }) => {
        if (Number(data.classId) === numericClassId) handlers.onSessionStarted(data);
      },
      sessionEnded: (data: { classId: number }) => {
        if (Number(data.classId) === numericClassId) handlers.onSessionEnded(data);
      },
      breakoutStarted: (data: any) => {
        if (Number(data.classId) === numericClassId) handlers.onBreakoutStarted(data);
      },
      breakoutEnded: (data: { classId: number }) => {
        if (Number(data.classId) === numericClassId) handlers.onBreakoutEnded(data);
      },
      teacherDelegated: (data: { classId: number }) => {
        if (Number(data.classId) === numericClassId) handlers.onTeacherDelegated(data);
      },
      teacherResumed: (data: TeacherResumedPayload) => {
        if (Number(data.classId) === numericClassId) handlers.onTeacherResumed(data);
      },
      pulseUpdate: (data: { classId: number; count: number }) => {
        if (Number(data.classId) === numericClassId) handlers.onPulseUpdate(data);
      },
      liveInit: (data: LiveInitPayload) => {
        if (Number(data.classId) === numericClassId) handlers.onLiveInit?.(data);
      },
    };

    socket.on("live_session_started", wrappedHandlers.sessionStarted);
    socket.on("live_session_ended", wrappedHandlers.sessionEnded);
    socket.on("breakout_session_started", wrappedHandlers.breakoutStarted);
    socket.on("breakout_session_ended", wrappedHandlers.breakoutEnded);
    socket.on("teacher_delegated", wrappedHandlers.teacherDelegated);
    socket.on("teacher_resumed", wrappedHandlers.teacherResumed);
    socket.on("live_pulse_update", wrappedHandlers.pulseUpdate);
    socket.on("live:init", wrappedHandlers.liveInit);

    return () => {
      socket.off("live_session_started", wrappedHandlers.sessionStarted);
      socket.off("live_session_ended", wrappedHandlers.sessionEnded);
      socket.off("breakout_session_started", wrappedHandlers.breakoutStarted);
      socket.off("breakout_session_ended", wrappedHandlers.breakoutEnded);
      socket.off("teacher_delegated", wrappedHandlers.teacherDelegated);
      socket.off("teacher_resumed", wrappedHandlers.teacherResumed);
      socket.off("live_pulse_update", wrappedHandlers.pulseUpdate);
      socket.off("live:init", wrappedHandlers.liveInit);
    };
  }, [numericClassId, handlers]);
};
