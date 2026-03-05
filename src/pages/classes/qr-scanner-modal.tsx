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
import { Loader2, Camera, CheckCircle2, AlertCircle, XCircle, Keyboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

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
          setScanResult({ success: true, message: "Attendance marked! Redirecting to class..." });
          open?.({
            type: "success",
            message: "Attendance Marked",
            description: "You have been marked as present and are being redirected.",
          });
          
          // Wait 1.5 seconds for the user to see the success message, then redirect and close
          setTimeout(() => {
            onClose();
            navigate(`/classes/show/${classId}`);
          }, 1500);
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
      <DialogContent className="sm:max-w-[450px]">
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

        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {isScanning ? (
            <>
              {mode === "camera" ? (
                <div className="w-full overflow-hidden rounded-xl border-2 border-primary/20 bg-black/5 aspect-square relative">
                  <div id="qr-reader" className="w-full h-full" />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[250px] h-[250px] border-2 border-primary/50 rounded-lg border-dashed animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="w-full py-8 space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Enter code (e.g. ABC123XY)" 
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      className="h-12 text-center text-xl font-bold tracking-widest"
                      maxLength={32}
                    />
                  </div>
                  <Button className="w-full h-11 gap-2" onClick={handleManualSubmit} disabled={!manualCode.trim()}>
                    Submit Code
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground"
                onClick={() => setMode(mode === "camera" ? "manual" : "camera")}
              >
                {mode === "camera" ? "Switch to Manual Entry" : "Switch to Camera Scan"}
              </Button>
            </>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center space-y-4 text-center">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm font-medium">Verifying attendance...</p>
                </>
              ) : scanResult?.success ? (
                <>
                  <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-green-600">Success!</h3>
                    <p className="text-sm text-muted-foreground">{scanResult.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-destructive">Verification Failed</h3>
                    <p className="text-sm text-muted-foreground">{scanResult?.message}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsScanning(true);
                      setScanResult(null);
                      setManualCode("");
                    }}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="w-full flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-[11px] text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>Camera access requires HTTPS or localhost. If you are on desktop, manual entry is recommended.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
