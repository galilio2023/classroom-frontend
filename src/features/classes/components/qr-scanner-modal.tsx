import { useState, useEffect, useRef } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Loader2, Camera, CheckCircle2, AlertCircle, XCircle, Keyboard, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export const QRScannerModal = ({ isOpen, onClose, classId }: QRScannerModalProps) => {
  const { open } = useNotification();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const { mutate: markAttendance, mutation } = useCustomMutation() as any;

  useEffect(() => {
    if (!isOpen || mode !== "camera") {
      if (scannerRef.current) {
        try {
            scannerRef.current.clear();
        } catch (e) {
            console.warn("Scanner clear failed", e);
        }
        scannerRef.current = null;
      }
      if (!isOpen) {
        setScanResult(null);
        setIsScanning(true);
        setMode("camera");
      }
      return;
    }

    const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          /* verbose= */ false
        );
    
        scannerRef.current = scanner;
    
        scanner.render(
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              if (String(data.classId) === String(classId) && data.token) {
                handleScanSuccess(data.token);
                scanner.clear().catch(e => console.warn(e));
              } else {
                setScanResult({ success: false, message: "Invalid QR code for this class." });
              }
            } catch (e) {
              setScanResult({ success: false, message: "Invalid QR code format." });
            }
          },
          () => {}
        );
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
            scannerRef.current.clear();
        } catch (e) {
            console.warn(e);
        }
        scannerRef.current = null;
      }
    };
  }, [isOpen, classId, mode]);

  const handleScanSuccess = (token: string) => {
    setIsScanning(false);
    
    markAttendance(
      {
        url: "/attendance/scan",
        method: "post",
        values: {
          classId,
          token,
        },
      },
      {
        onSuccess: () => {
          setScanResult({ success: true, message: "You've been marked present!" });
          open?.({
            type: "success",
            message: "Attendance Marked",
            description: "You have been marked as present and are being redirected.",
          });
          
          setTimeout(() => {
            onClose();
            navigate(`/classes/show/${classId}`);
          }, 2000);
        },
        onError: (error: any) => {
          setScanResult({ 
            success: false, 
            message: error?.response?.data?.message || error?.message || "Failed to mark attendance. The code might have expired."
          });
        },
      }
    );
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "camera" ? <Camera className="h-5 w-5 text-primary" /> : <Keyboard className="h-5 w-5 text-primary" />}
            {mode === "camera" ? "Scan QR Attendance" : "Enter Attendance Code"}
          </DialogTitle>
          <DialogDescription>
            {mode === "camera" 
              ? "Point your camera at the QR code displayed by your teacher." 
              : "Type the 8-character code shown on the teacher's screen."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          {isScanning ? (
            <>
              {mode === "camera" ? (
                <div className="w-full overflow-hidden rounded-2xl border-4 border-primary/10 bg-black/5 aspect-square relative shadow-inner">
                  <div id="qr-reader" className="w-full h-full" />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[250px] h-[250px] border-4 border-primary/40 rounded-2xl border-dashed animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="w-full py-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <Keyboard className="h-3 w-3" />
                        Manual Entry
                    </div>
                    <Input 
                      placeholder="ABC123XY" 
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      className="h-16 text-center text-3xl font-black tracking-[0.3em] font-mono border-2 border-primary/20 bg-primary/5 rounded-2xl focus-visible:ring-primary/30"
                      maxLength={32}
                    />
                  </div>
                  <Button className="w-full h-12 text-lg font-black gap-2 shadow-lg shadow-primary/20 rounded-xl" onClick={handleManualSubmit} disabled={!manualCode.trim()}>
                    Check In
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/5"
                onClick={() => setMode(mode === "camera" ? "manual" : "camera")}
              >
                {mode === "camera" ? "Switch to Manual Entry" : "Switch to Camera Scan"}
              </Button>
            </>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center space-y-6 text-center">
              {mutation.isLoading ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                    <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Verifying Check-in...</p>
                </div>
              ) : scanResult?.success ? (
                <div className="animate-in zoom-in-95 duration-500 space-y-6">
                  <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20 border-2 border-green-500/20">
                    <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tight text-green-600">You're marked present!</h3>
                    <p className="text-sm font-medium text-muted-foreground">{scanResult.message}</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Redirecting to class...
                  </div>
                </div>
              ) : (
                <div className="animate-in zoom-in-95 duration-500 space-y-6">
                  <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-destructive/20 border-2 border-destructive/20">
                    <XCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight text-destructive">Check-in Failed</h3>
                    <p className="text-sm font-medium text-muted-foreground max-w-[250px] mx-auto">{scanResult?.message}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsScanning(true);
                      setScanResult(null);
                      setManualCode("");
                    }}
                    className="h-11 px-8 font-black uppercase tracking-widest text-xs rounded-xl"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="w-full flex items-center gap-3 p-4 bg-muted/50 rounded-2xl text-[10px] font-medium text-muted-foreground border border-black/5">
            <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
            <p>Camera access requires HTTPS. If you're on a desktop or have issues, use the manual entry code provided by your teacher.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
