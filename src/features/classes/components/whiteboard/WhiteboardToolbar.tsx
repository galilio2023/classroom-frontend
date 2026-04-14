import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  Loader2,
  Trash2,
  AlertCircle,
  Save,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhiteboardToolbarProps {
  roomId?: string;
  isTeacher: boolean;
  isLocked: boolean;
  onToggleLock: (checked: boolean) => void;
  isRemotePending: boolean;
  isAnalyzing: boolean;
  isTidying: boolean;
  isHelpersLoading: boolean;
  onAnalyze: () => void;
  onTidy: () => void;
  onClear: () => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  classId?: string;
  canDiscardTidy?: boolean;
  onDiscardTidy?: () => void;
}

export const WhiteboardToolbar = ({
  roomId,
  isTeacher,
  isLocked,
  onToggleLock,
  isRemotePending,
  isAnalyzing,
  isTidying,
  isHelpersLoading,
  onAnalyze,
  onTidy,
  onClear,
  isSaving,
  isDirty,
  onSave,
  classId,
  canDiscardTidy,
  onDiscardTidy,
}: WhiteboardToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-muted/30">
      <div className="flex items-center gap-4 text-start">
        <h4 className="text-sm font-semibold px-2">
          {roomId ? "Group Whiteboard" : "Class Whiteboard"}
        </h4>
        {isTeacher && (
          <div className="flex items-center space-x-2">
            <Switch id="lock-mode" checked={isLocked} onCheckedChange={onToggleLock} />
            <Label htmlFor="lock-mode" className="text-xs flex items-center gap-1">
              {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              {isLocked ? "Students Locked" : "Students Can Draw"}
            </Label>
          </div>
        )}
        {!isTeacher && isLocked && (
          <div className="flex items-center gap-1 text-xs text-destructive font-medium">
            <Lock className="h-3 w-3" />
            Drawing is currently disabled by teacher
          </div>
        )}
        {isRemotePending && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-bold animate-pulse border border-amber-500/20">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Sync paused while you draw...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isTeacher && (
          <>
            {canDiscardTidy && onDiscardTidy && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscardTidy}
                className="h-8 border-destructive/30 hover:bg-destructive/5 text-destructive font-bold group transition-all"
              >
                <Undo2 className="h-4 w-4 me-1 group-hover:-translate-x-0.5 transition-transform" />
                Undo Tidy
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onTidy}
              disabled={isTidying || isHelpersLoading}
              className="h-8 border-ai-secondary/30 hover:bg-ai-secondary/5 text-ai-secondary font-bold group transition-all"
            >
              {isTidying ? (
                <Loader2 className="h-4 w-4 animate-spin me-1" />
              ) : (
                <Sparkles className="h-4 w-4 me-1 group-hover:scale-110 transition-transform" />
              )}
              AI Tidy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAnalyze}
              disabled={isAnalyzing || isHelpersLoading}
              className="h-8 border-ai-primary/30 hover:bg-ai-primary/5 text-ai-primary font-bold group transition-all"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin me-1" />
              ) : (
                <Sparkles className="h-4 w-4 me-1 group-hover:rotate-12 transition-transform" />
              )}
              Analyze with AI
            </Button>
            <Button variant="outline" size="sm" onClick={onClear} className="h-8">
              <Trash2 className="h-4 w-4 me-1" />
              Clear
            </Button>
          </>
        )}
        {classId && (
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={isSaving || isHelpersLoading}
            className={cn(
              "h-8 transition-all",
              isDirty
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-live-primary hover:bg-live-primary/90"
            )}
          >
            {isSaving || isHelpersLoading ? (
              <Loader2 className="h-4 w-4 animate-spin me-1" />
            ) : isDirty ? (
              <AlertCircle className="h-4 w-4 me-1 animate-pulse" />
            ) : (
              <Save className="h-4 w-4 me-1" />
            )}
            {isHelpersLoading
              ? "Loading..."
              : isSaving
                ? "Saving..."
                : isDirty
                  ? "Save Pending..."
                  : "Save Snapshot"}
          </Button>
        )}
      </div>
    </div>
  );
};
