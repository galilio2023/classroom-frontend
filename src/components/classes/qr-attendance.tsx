import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, StopCircle, PlayCircle, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { useCustomMutation } from "@refinedev/core";

interface QRAttendanceProps {
  classId: number;
  className: string;
}

export const QRAttendance = ({ classId, className }: QRAttendanceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [qrValue, setQrValue] = useState("");

  const DURATION = 300; // 5 minutes in seconds
  const { mutate: generateQR } = useCustomMutation();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // Socket.io for real-time scan updates
  useEffect(() => {
    if (!isActive) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace("/api", "");
    const socket = io(socketUrl, { query: { classId }, withCredentials: true });

    socket.on("attendance_scanned", (data) => {
      setScannedCount((prev) => prev + 1);
      toast.success(`${data.studentName} checked in!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [isActive, classId]);

  const startSession = () => {
    // Call backend to generate a secure, time-limited token
    generateQR({
        url: "/attendance/qr",
        method: "post",
        values: { classId }
    }, {
        onSuccess: (data: any) => {
            const token = data.data.token;
            setQrValue(`${window.location.origin}/attendance/scan?token=${token}`);
            setIsActive(true);
            setTimeLeft(DURATION);
            setScannedCount(0);
            toast.success(`Attendance session started for ${className}!`);
        },
        onError: () => {
            toast.error("Failed to start attendance session.");
        }
    });
  };

  const stopSession = () => {
    setIsActive(false);
    setTimeLeft(0);
    toast.info("Attendance session stopped.");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / DURATION) * 100;

  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">QR Attendance</CardTitle>
          </div>
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500 animate-pulse" : ""}>
            {isActive ? "Active Session" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>
          Students can scan the QR code to mark themselves present.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center gap-6">
        {isActive ? (
          <>
            <div className="p-4 bg-white rounded-2xl shadow-inner border-4 border-primary/10">
              <QRCodeSVG value={qrValue} size={200} level="H" includeMargin />
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Time Remaining: <span className="text-foreground font-bold font-mono">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Checked In: <span className="text-primary font-bold">{scannedCount}</span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Button variant="destructive" className="w-full gap-2 h-11 rounded-xl" onClick={stopSession}>
              <StopCircle className="h-4 w-4" />
              Stop Session
            </Button>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center gap-6 text-center">
            <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
              <QrCode className="h-12 w-12 text-primary/20" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold">Ready to start?</h4>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Starting a session will generate a unique QR code for this class.
              </p>
            </div>
            <Button className="w-full gap-2 h-11 rounded-xl shadow-md" onClick={startSession}>
              <PlayCircle className="h-4 w-4" />
              Start Attendance Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
