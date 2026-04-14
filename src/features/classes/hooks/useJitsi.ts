import { useRef, useCallback, useEffect, useState } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface JitsiMeetExternalAPI {
  dispose: () => void;
  on: (event: string, callback: (payload: any) => void) => void;
  executeCommand: (command: string, ...args: any[]) => void;
  captureLargeVideoScreenshot: () => Promise<string | { dataURL: string }>;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: {
      new (domain: string, options: any): JitsiMeetExternalAPI;
    };
  }
}

export const useJitsi = (
  classIdString: string,
  identity: User | undefined,
  isTeacher: boolean,
  onJoinSuccess?: (groupId?: number) => void,
  onJoinFailed?: () => void,
  onLeave?: () => void,
  onRecordingSaved?: (link: string) => void
) => {
  const { t } = useTranslation();
  const apiRef = useRef<JitsiMeetExternalAPI | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [isJitsiLoading, setIsJitsiLoading] = useState(false);

  const numericClassId = Number(classIdString);

  const initializeJitsi = useCallback(
    (roomName: string, token?: string, groupId?: number) => {
      if (!window.JitsiMeetExternalAPI || !identity || !jitsiContainerRef.current) return;

      jitsiContainerRef.current.innerHTML = "";
      const domain = "meet.jit.si";
      const options = {
        roomName: roomName,
        jwt: token,
        width: "100%",
        height: 600,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: identity.name,
          email: identity.email,
        },
        configOverwrite: {
          startWithAudioMuted: !isTeacher,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          enableLobby: false,
          disableRecording: !!groupId && !isTeacher,
        },
      };

      try {
        const newApi = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = newApi;

        newApi.on("videoConferenceJoined", () => {
          setIsJitsiLoading(false);
          onJoinSuccess?.(groupId);
        });

        newApi.on("videoConferenceLeft", () => {
          onLeave?.();
          apiRef.current = null;
        });

        newApi.on("readyToClose", () => {
          onLeave?.();
          apiRef.current = null;
        });

        newApi.on(
          "recordingStatusChanged" as any,
          (payload: { on: boolean; link?: string; error?: string }) => {
            if (!payload.on && payload.link && isTeacher && !groupId) {
              onRecordingSaved?.(payload.link);
            }
          }
        );
      } catch (err) {
        console.error("Error initializing Jitsi:", err);
        setIsJitsiLoading(false);
        onJoinFailed?.();
        toast.error(t("classes.live.toasts.initFailed"));
      }
    },
    [identity, isTeacher, onJoinSuccess, onJoinFailed, onLeave, onRecordingSaved, t]
  );

  const startMeeting = useCallback(
    (
      roomTokenFetcher: (groupId?: number) => Promise<{ roomName: string; token?: string }>,
      groupId?: number
    ) => {
      if (!identity || isNaN(numericClassId)) return;

      const SCRIPT_ID = "jitsi-external-api";
      if (!window.JitsiMeetExternalAPI && !document.getElementById(SCRIPT_ID)) {
        setIsJitsiLoading(true);
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => {
          startMeeting(roomTokenFetcher, groupId);
        };
        document.body.appendChild(script);
        return;
      }

      setIsJitsiLoading(true);
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }

      roomTokenFetcher(groupId)
        .then(({ roomName, token }) => {
          initializeJitsi(roomName, token, groupId);
        })
        .catch((err) => {
          console.error("Jitsi: Failed to get room token", err);
          const fallbackRoom = `tablawy-room-${numericClassId}${groupId ? `-group-${groupId}` : ""}`;
          initializeJitsi(fallbackRoom, undefined, groupId);
        });
    },
    [identity, numericClassId, initializeJitsi]
  );

  const disposeJitsi = useCallback(() => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => disposeJitsi();
  }, [disposeJitsi]);

  return {
    jitsiContainerRef,
    apiRef,
    isJitsiLoading,
    startMeeting,
    disposeJitsi,
  };
};
