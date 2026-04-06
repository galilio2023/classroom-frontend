import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { withTranslation, WithTranslation } from "react-i18next";

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AIErrorBoundaryBase extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[AIErrorBoundary:${this.props.name || "Unknown"}]`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    const { t } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Card className="p-8 border-2 border-dashed border-ai-primary/20 bg-ai-primary/5 rounded-[2rem] flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300 ai-gradient-border">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-background shadow-xl border border-ai-primary/10">
              <Sparkles className="h-8 w-8 text-ai-primary/40" />
              <AlertCircle className="h-4 w-4 text-destructive absolute -top-1 -right-1" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight">
              {t("ai.errorBoundary.title", "AI Assistant Offline")}
            </h3>
            <p className="text-xs font-medium text-muted-foreground max-w-[240px]">
              {t(
                "ai.errorBoundary.description",
                "Something went wrong while communicating with Gemini. This is usually temporary."
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5"
          >
            <RefreshCcw className="h-3 w-3" />
            {t("ai.errorBoundary.tryAgain", "Try Again")}
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

export const AIErrorBoundary = withTranslation()(AIErrorBoundaryBase);
