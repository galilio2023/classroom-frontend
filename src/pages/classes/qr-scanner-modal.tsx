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
import { Loader2, Camera, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export const QRScannerModal = ({ isOpen, onClose, classId }: QRScannerModalProps) => {
  const { open } = useNotification();
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const { mutate: markAttendance, mutation } = useCustomMutation() as any;

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setScanResult(null);
      setIsScanning(true);
      return;
    }

    // Initialize scanner
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
        // Success callback
        try {
          const data = JSON.parse(decodedText);
          if (data.classId === classId && data.token) {
            handleScanSuccess(data.token);
            scanner.clear();
          } else {
            setScanResult({ success: false, message: "Invalid QR code for this class." });
          }
        } catch (e) {
          setScanResult({ success: false, message: "Invalid QR code format." });
        }
      },
      (_errorMessage) => {
        // Error callback (usually just "no QR code found in frame")
        // console.log(errorMessage);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isOpen, classId]);

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
          setScanResult({ success: true, message: "Attendance marked successfully!" });
          open?.({
            type: "success",
            message: "Attendance Marked",
            description: "You have been marked as present.",
          });
          // Close modal after 2 seconds on success
          setTimeout(onClose, 2000);
        },
        onError: (error: any) => {
          setScanResult({ 
            success: false, 
            message: error?.message || "Failed to mark attendance. The code might have expired." 
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Scan QR Attendance
          </DialogTitle>
          <DialogDescription>
            Point your camera at the QR code displayed by your teacher.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {isScanning ? (
            <div className="w-full overflow-hidden rounded-xl border-2 border-primary/20 bg-black/5 aspect-square relative">
              <div id="qr-reader" className="w-full h-full" />
              
              {/* Overlay for better UX */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[250px] h-[250px] border-2 border-primary/50 rounded-lg border-dashed animate-pulse" />
              </div>
            </div>
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
                    <h3 className="text-lg font-bold text-destructive">Scan Failed</h3>
                    <p className="text-sm text-muted-foreground">{scanResult?.message}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsScanning(true);
                      setScanResult(null);
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
            <p>Make sure you are in the classroom and the QR code is clearly visible on the screen.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
