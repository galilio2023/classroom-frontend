import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useResourceParams, useTranslate } from "@refinedev/core";
import { ChevronLeft, InfoIcon, Home } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Enhanced Error Component with forced navigation to break out of 404 states.
 */
export function ErrorComponent() {
  const [errorMessage, setErrorMessage] = useState<string>();
  const translate = useTranslate();
  const { resource, action } = useResourceParams();

  useEffect(() => {
    if (resource && action) {
      setErrorMessage(
        translate(
          "pages.error.info",
          {
            action: action,
            resource: resource?.name,
          },
          `You may have forgotten to add the "${action}" component to "${resource?.name}" resource.`
        )
      );
    }
  }, [resource, action, translate]);

  const handleBackToDashboard = () => {
    // Forced navigation to ensure the app re-renders the dashboard correctly
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background w-full">
      <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-md px-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <h1 className="relative text-9xl font-black tracking-tighter text-primary/10">404</h1>
          </div>
        </div>

        <div className="space-y-4 relative">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            {translate("pages.error.title", "Lost in Space?")}
          </h2>

          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {translate(
                "pages.error.description",
                "The page you're looking for doesn't exist. It might have been moved or deleted."
              )}
            </p>
            {errorMessage && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-[10px] text-primary cursor-help mt-2 font-bold uppercase tracking-widest">
                        <InfoIcon className="h-3 w-3" />
                        Technical Details
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">{errorMessage}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
            <Button 
                size="lg" 
                className="gap-2 rounded-xl px-8 shadow-xl shadow-primary/20 font-bold"
                onClick={handleBackToDashboard}
            >
                <Home className="h-4 w-4" />
                {translate("pages.error.backHome", "Return to Dashboard")}
            </Button>
            
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.history.back()}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Go Back
            </Button>
        </div>
      </div>
    </div>
  );
}

ErrorComponent.displayName = "ErrorComponent";
