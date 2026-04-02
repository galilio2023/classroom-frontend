import { useState, useEffect } from "react";
import { useCustom, useGetIdentity } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { User, Attendance } from "@/types";
import {
  Loader2,
  CheckCircle2,
  Users,
  RefreshCw,
  Key,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QRAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

import { socket, connectSocket } from "@/lib/socket";

export const QRAttendanceModal = ({ isOpen, onClose, classId }: QRAttendanceModalProps) => {
  const { data: identity } = useGetIdentity<User>();
  const [token, setToken] = useState<string | null>(null);
  const [scannedStudents, setScannedStudents] = useState<Attendance[]>([]);
  const [tokenTimeLeft, setTokenTimeLeft] = useState(10);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);

  const DURATION = 300;

  // Fetch initial token
  const { query } = useCustom<{ token: string }>({
    url: `/attendance/qr-token/${classId}`,
    method: "get",
    config: {
      query: {
        _t: Date.now(),
      },
    },
    queryOptions: {
      enabled: isOpen && !isExpired,
    },
  });

  const { data: tokenData, refetch, isLoading, isError: isTokenError } = query;

  useEffect(() => {
    if (tokenData?.data?.token) {
      setToken(tokenData.data.token);
      setTokenTimeLeft(10);
    }
  }, [tokenData]);

  // 🚀 TRUTH IN FAILURE: Clear token on error to prevent students from scanning stale codes
  useEffect(() => {
    if (isTokenError) {
      setToken(null);
    }
  }, [isTokenError]);

  useEffect(() => {
    if (!isOpen || isExpired) return;

    const interval = setInterval(() => {
      setTokenTimeLeft((prev) => {
        if (prev <= 1) {
          void refetch();
          return 10;
        }
        return prev - 1;
      });

      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isExpired, refetch]);

  // Real-time Check-in Feed
  useEffect(() => {
    if (!isOpen || !identity) return;

    void connectSocket().then(() => {
      socket.emit("join_class", classId);

      socket.on("attendance_marked", (newRecord: Attendance) => {
        setScannedStudents((prev) => {
          if (prev.find((r) => r.id === newRecord.id)) return prev;
          return [newRecord, ...prev];
        });
      });
    });

    return () => {
      socket.off("attendance_marked");
      socket.emit("leave_class", classId);
    };
  }, [isOpen, identity, classId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRestart = () => {
    setIsExpired(false);
    setSessionTimeLeft(DURATION);
    setScannedStudents([]);
    void refetch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Live QR Attendance
          </DialogTitle>
          <DialogDescription>
            {isExpired
              ? "This attendance session has ended."
              : "Students can scan this code or enter the manual token below."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          {/* Session Timer & Progress */}
          {!isExpired && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Session Ends In:{" "}
                  <span className="text-foreground font-mono">{formatTime(sessionTimeLeft)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  Checked In: <span className="text-primary">{scannedStudents.length}</span>
                </div>
              </div>
              <Progress value={(sessionTimeLeft / DURATION) * 100} className="h-1.5" />
            </div>
          )}

          {/* QR Code Section */}
          <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-primary/5 transition-all duration-500">
            {isExpired ? (
              <div className="w-[200px] h-[200px] flex flex-col items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-destructive/30 gap-3">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-sm font-black uppercase tracking-tighter text-destructive">
                  QR Expired
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-black uppercase tracking-widest gap-2"
                  onClick={handleRestart}
                >
                  <RotateCcw className="h-3 w-3" />
                  New Session
                </Button>
              </div>
            ) : isTokenError ? (
              <div className="w-[200px] h-[200px] flex flex-col items-center justify-center bg-destructive/5 rounded-lg border-2 border-dashed border-destructive/20 gap-2 p-4 text-center">
                <AlertCircle className="h-8 w-8 text-destructive opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-tighter text-destructive">
                  Connection Error
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[9px] font-black uppercase tracking-widest hover:bg-destructive/10"
                  onClick={() => void refetch()}
                >
                  <RotateCcw className="h-3 w-3 me-1" />
                  Retry Sync
                </Button>
              </div>
            ) : isLoading && !token ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              token && (
                <div className="animate-in zoom-in-95 duration-300">
                  <QRCodeSVG
                    value={JSON.stringify({ classId, token })}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              )
            )}

            {/* Refresh Indicator */}
            {!isExpired && (
              <div className="absolute -bottom-3 start-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg border-2 border-background">
                <RefreshCw className={cn("h-3 w-3", tokenTimeLeft === 10 ? "animate-spin" : "")} />
                Refreshing in {tokenTimeLeft}s
              </div>
            )}
          </div>

          {/* Manual Code Display */}
          {!isExpired && (
            <div className="w-full bg-primary/5 p-4 rounded-2xl border border-primary/10 flex flex-col items-center gap-2 shadow-inner">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                <Key className="h-3 w-3" />
                Manual Entry Token
              </div>
              <div className="text-4xl font-black tracking-[0.4em] text-primary font-mono drop-shadow-sm">
                {token ? token.substring(0, 8).toUpperCase() : "--------"}
              </div>
              <p className="text-[10px] text-muted-foreground text-center font-medium">
                Tell students to type this code if their camera isn't working.
              </p>
            </div>
          )}

          {/* Scanned Students List */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                Live Check-in Feed
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 min-w-[20px] justify-center bg-primary/10 text-primary border-none"
                >
                  {scannedStudents.length}
                </Badge>
              </h4>
            </div>

            <ScrollArea className="h-[140px] w-full rounded-2xl border bg-muted/30 p-2">
              {scannedStudents.length > 0 ? (
                <div className="space-y-2">
                  {scannedStudents.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-background border shadow-sm animate-in slide-in-from-end-4 duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-primary/10">
                          <AvatarImage src={record.student?.image || ""} />
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                            {record.student?.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold leading-tight">
                            {record.student?.name}
                          </span>
                          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter text-muted-foreground">
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="h-7 w-7 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 opacity-40">
                  <Users className="h-8 w-8 mb-2 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Waiting for scans...
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
