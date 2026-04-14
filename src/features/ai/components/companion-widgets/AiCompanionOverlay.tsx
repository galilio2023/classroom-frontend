import React from "react";
import { Mic, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiCompanionOverlayProps {
  isPermissionDenied: boolean;
  isBrowserSupported: boolean;
  isHydrated: boolean;
  onJoin: () => void;
}

/**
 * 🛡️ ATOMIC WIDGET: AI Companion Overlay
 * Manages the interactive session startup and prerequisite errors.
 */
export const AiCompanionOverlay = React.memo(
  ({ isPermissionDenied, isBrowserSupported, isHydrated, onJoin }: AiCompanionOverlayProps) => {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md text-center p-8">
        {isPermissionDenied ? (
          <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl max-w-xs animate-in fade-in zoom-in duration-300">
            <Mic className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h4 className="text-white font-bold mb-2">Microphone Access Denied</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Please enable microphone permissions in your browser settings to interact with the AI
              Co-Teacher.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : !isBrowserSupported && isHydrated ? (
          <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl max-w-xs animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h4 className="text-white font-bold mb-2">Browser Not Supported</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Speech interaction requires a modern browser like Chrome or Edge.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </div>
        ) : (
          <>
            <Sparkles className="w-12 h-12 text-ai-primary mb-4 animate-pulse" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
              Start Interactive AI Session
            </h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs">
              Click the button below to allow your AI Co-Teacher to speak and listen for your
              questions.
            </p>
            <Button
              size="lg"
              onClick={onJoin}
              className="rounded-full bg-ai-primary hover:bg-ai-primary/80 text-white font-bold px-12"
            >
              Join AI Session
            </Button>
          </>
        )}
      </div>
    );
  }
);
