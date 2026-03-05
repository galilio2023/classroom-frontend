import { useState, useEffect, useRef } from "react";
import { useCustom, useGetIdentity } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/config";
import { User, Attendance } from "@/types";
import { Loader2, CheckCircle2, Users, RefreshCw, Key } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface QRAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export const QRAttendanceModal = ({ isOpen, onClose, classId }: QRAttendanceModalProps) => {
  const { data: identity } = useGetIdentity<User>();
  const [token, setToken] = useState<string | null>(null);
  const [scannedStudents, setScannedStudents] = useState<Attendance[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial token
  const { query } = useCustom<{ token: string }>({
    url: `/attendance/qr-token/${classId}`,
    method: "get",
    config: {
      query: {
        _t: Date.now(), // Cache busting
      },
    },
    queryOptions: {
      enabled: isOpen,
    },
  });

  const { data: tokenData, refetch, isLoading } = query;

  useEffect(() => {
    if (tokenData?.data?.token) {
      setToken(tokenData.data.token);
      setTimeLeft(10);
    }
  }, [tokenData]);

  // Refresh token every 10 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (typeof refetch === 'function') {
            void refetch();
          }
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, refetch]);

  // Socket.io for real-time updates
  useEffect(() => {
    if (!isOpen || !identity) return;

    // Connect to socket
    const socketUrl = BACKEND_URL.replace("/api", "");
    const socket = io(socketUrl, {
      query: {
        userId: identity.id,
        classId: classId,
      },
      transports: ["websocket"], // Force websocket transport
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to attendance socket");
    });

    socket.on("attendance_marked", (newRecord: Attendance) => {
      setScannedStudents((prev) => {
        // Avoid duplicates
        if (prev.find((r) => r.studentId === newRecord.studentId)) return prev;
        return [newRecord, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, identity, classId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Live QR Attendance
          </DialogTitle>
          <DialogDescription>
            Students can scan this code or enter the manual token below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {/* QR Code Section */}
          <div className="relative p-4 bg-white rounded-xl shadow-sm border-2 border-primary/10">
            {isLoading && !token ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              token && (
                <QRCodeSVG
                  value={JSON.stringify({ classId, token })}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              )
            )}
            
            {/* Refresh Indicator */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-md">
              <RefreshCw className={`h-3 w-3 ${timeLeft === 10 ? 'animate-spin' : ''}`} />
              Refreshing in {timeLeft}s
            </div>
          </div>

          {/* Manual Code Display for Teacher */}
          <div className="w-full bg-muted/50 p-4 rounded-xl border border-dashed flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Key className="h-3 w-3" />
                Manual Entry Token
            </div>
            <div className="text-3xl font-black tracking-[0.3em] text-primary font-mono">
                {token ? token.substring(0, 8).toUpperCase() : "--------"}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
                Tell students to type this code if their camera isn't working.
            </p>
          </div>

          {/* Scanned Students List */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                Recently Scanned
                <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
                  {scannedStudents.length}
                </Badge>
              </h4>
            </div>
            
            <ScrollArea className="h-[150px] w-full rounded-md border p-2 bg-muted/30">
              {scannedStudents.length > 0 ? (
                <div className="space-y-2">
                  {scannedStudents.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-background border shadow-sm animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={record.student?.image || ""} />
                          <AvatarFallback>{record.student?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{record.student?.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                  <Users className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">Waiting for students to scan...</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
