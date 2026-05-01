import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, StopCircle, PlayCircle, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {} from "socket.io-client";
import { useCustomMutation } from "@refinedev/core";
import {} from "@/config";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface QRAttendanceProps {
  classId: number;
  className?: string;
}

import { socket, connectSocket } from "@/lib/socket";

export const QRAttendance = ({ classId, className }: QRAttendanceProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [qrValue, setQrValue] = useState("");

  const DURATION = 300; // 5 minutes in seconds
  const { mutate: generateQR } = useCustomMutation();

  // ... (timer logic)

  // Socket.io for real-time scan updates
  useEffect(() => {
    if (!isActive) return;

    void connectSocket().then(() => {
      socket.emit("join_class", { classId });

      socket.on("attendance_marked", (data: { studentName: string }) => {
        setScannedCount((prev) => prev + 1);
        toast.success(`${data.studentName} checked in!`);
      });
    });

    return () => {
      socket.off("attendance_marked");
      socket.emit("leave_class", { classId });
    };
  }, [isActive, classId]);

  const startSession = () => {
    // Call backend to generate a secure, time-limited token
    generateQR(
      {
        url: "/attendance/qr",
        method: "post",
        values: { classId },
      },
      {
        onSuccess: (data: any) => {
          const token = data.data.token;
          setQrValue(`${window.location.origin}/attendance/scan?token=${token}`);
          setIsActive(true);
          setTimeLeft(DURATION);
          setScannedCount(0);
          toast.success(
            t("classes.attendance.toast.savedDescription", {
              date: new Date().toLocaleDateString(),
              defaultValue: `Attendance session started for ${new Date().toLocaleDateString()}`,
            } as any) as string
          );
        },
        onError: () => {
          toast.error(t("common.upload.error") as string);
        },
      }
    );
  };

  const stopSession = () => {
    setIsActive(false);
    setTimeLeft(0);
    toast.info(t("buttons.stopSession") as string);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMins = new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(mins);
    const formattedSecs = new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US")
      .format(secs)
      .padStart(2, isArabic ? "٠" : "0");
    return `${formattedMins}:${formattedSecs}`;
  };

  const progress = (timeLeft / DURATION) * 100;

  return (
    <Card className={cn("border-primary/20 shadow-lg overflow-hidden", className)}>
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("classes.attendance.qr.title")}</CardTitle>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={cn(isActive && "bg-green-500 animate-pulse")}
          >
            {isActive ? t("classes.attendance.qr.active") : t("classes.attendance.qr.inactive")}
          </Badge>
        </div>
        <CardDescription>{t("classes.attendance.qr.description")}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center gap-6">
        {isActive ? (
          <>
            <div className="p-4 bg-white rounded-2xl shadow-inner border-4 border-primary/10">
              <QRCodeSVG value={qrValue} size={200} level="H" marginSize={4} />
            </div>

            <div className="w-full space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t("classes.attendance.qr.timeRemaining")}:{" "}
                  <span className="text-foreground font-bold font-mono">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {t("classes.attendance.qr.checkedIn")}:{" "}
                  <span className="text-primary font-bold">
                    {new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(scannedCount)}
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Button
              variant="destructive"
              className="w-full gap-2 h-11 rounded-xl"
              onClick={stopSession}
            >
              <StopCircle className="h-4 w-4" />
              {t("buttons.stopSession")}
            </Button>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center gap-6 text-center">
            <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
              <QrCode className="h-12 w-12 text-primary/20" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold">{t("classes.attendance.qr.ready")}</h4>
              <p className="text-sm text-muted-foreground max-w-62.5">
                {t("classes.attendance.qr.startDescription")}
              </p>
            </div>
            <Button className="w-full gap-2 h-11 rounded-xl shadow-md" onClick={startSession}>
              <PlayCircle className="h-4 w-4" />
              {t("buttons.startAttendance")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
