import { useEffect, useRef, useState } from "react";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Users } from "lucide-react";
import { toast } from "sonner";

interface LiveClassroomProps {
  classId: string;
  className?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const LiveClassroom = ({ classId }: LiveClassroomProps) => {
  const { data: identity } = useGetIdentity<User>();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: markLiveAttendance } = useCustomMutation();
  const { mutate: getRoomToken } = useCustomMutation();

  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  
  useEffect(() => {
    // Load Jitsi Script
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    return () => {
        if (api) {
            api.dispose();
        }
    };
  }, []);

  const startMeeting = () => {
    if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current || !identity) return;

    setIsLoading(true);

    // Fetch a secure, signed room token from the backend
    getRoomToken({
        url: "/live-session/token",
        method: "post",
        values: { classId: Number(classId) }
    }, {
        onSuccess: (data: any) => {
            const { roomName, token } = data.data;
            initializeJitsi(roomName, token);
        },
        onError: (error) => {
            setIsLoading(false);
            toast.error("Failed to join live session. Please try again.");
            console.error("Live session error:", error);
        }
    });
  };

  const initializeJitsi = (roomName: string, token?: string) => {
      if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current || !identity) return;

      const domain = "meet.jit.si";
      const options = {
        roomName: roomName,
        jwt: token, // Pass the JWT token for authentication/moderation
        width: "100%",
        height: 600,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: identity.name,
          email: identity.email,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "closedcaptions", "desktop", "fullscreen",
            "fodeviceselection", "hangup", "profile", "chat", "recording",
            "livestreaming", "etherpad", "sharedvideo", "settings", "raisehand",
            "videoquality", "filmstrip", "invite", "feedback", "stats", "shortcuts",
            "tileview", "videobackgroundblur", "download", "help", "mute-everyone",
            "security"
          ],
        },
      };

      const newApi = new window.JitsiMeetExternalAPI(domain, options);
      setApi(newApi);

      newApi.addEventListeners({
        videoConferenceJoined: () => {
          setIsLoading(false);
          setIsJoined(true);
          
          // --- SMART ATTENDANCE TRIGGER ---
          if (identity.role === UserRole.STUDENT) {
              markLiveAttendance({
                  url: "/attendance/live",
                  method: "post",
                  values: { classId: Number(classId) }
              }, {
                  onSuccess: () => {
                      toast.success("Attendance marked automatically!");
                  },
                  onError: () => {
                      toast.error("Failed to mark attendance. Please notify your teacher.");
                  }
              });
          }
        },
        videoConferenceLeft: () => {
          setIsJoined(false);
          setApi(null);
          // Clean up the container
          if (jitsiContainerRef.current) {
              jitsiContainerRef.current.innerHTML = "";
          }
        },
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-live-primary" />
            Live Classroom
          </h3>
          <p className="text-sm text-muted-foreground">
            {isTeacher 
              ? "Start a virtual session. Students will be marked present automatically when they join." 
              : "Join the live session to attend class and get credit."}
          </p>
        </div>
      </div>

      {!isJoined ? (
        <Card className="border-dashed py-12 text-center bg-muted/10">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-live-secondary rounded-full">
                <Users className="h-8 w-8 text-live-primary" />
            </div>
            <div className="space-y-2">
                <h4 className="text-xl font-bold">Ready to join?</h4>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Click below to enter the virtual classroom. 
                    {identity?.role === UserRole.STUDENT && " Your attendance will be recorded automatically."}
                </p>
            </div>
            <Button 
                size="lg" 
                onClick={startMeeting} 
                disabled={isLoading}
                className="bg-live-primary hover:bg-live-primary/90 text-white shadow-lg shadow-live-primary/20"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                {isTeacher ? "Start Live Session" : "Join Class Now"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl overflow-hidden border shadow-2xl bg-black">
            <div ref={jitsiContainerRef} className="w-full h-[600px]" />
        </div>
      )}
    </div>
  );
};
