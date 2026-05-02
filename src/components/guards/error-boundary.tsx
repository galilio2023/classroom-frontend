import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withTranslation, WithTranslation } from "react-i18next";
import { redactSensitiveData } from "@/lib/security";

interface Props extends WithTranslation {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);

    // 🛡️ PRODUCTION LOGGING: Send to an external service if needed
    if (import.meta.env.PROD) {
      // 🛡️ SECURITY: Aggressively redact PII from error metadata before transmission
      const sanitizedLog = redactSensitiveData({
        event: "uncaught_react_error",
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });

      console.error(JSON.stringify(sanitizedLog));
    }

    // Specifically handle dynamic import (chunk) failures
    if (
      error.name === "ChunkLoadError" ||
      error.message.includes("Failed to fetch dynamically imported module")
    ) {
      console.warn("Dynamic import failed, reloading page...");
      window.location.reload();
    }
  }

  public render() {
    const { t } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/5 rounded-lg text-center h-full min-h-[200px]">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">{t("common.error")}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {this.state.error?.message || t("common.aiServiceError")}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              {t("buttons.refresh", { defaultValue: "Refresh Page" })}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => this.setState({ hasError: false })}>
              {t("buttons.tryAgain")}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryInner);
