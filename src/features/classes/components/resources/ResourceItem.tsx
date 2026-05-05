import { Resource } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  Video,
  File,
  Trash2,
  MoreVertical,
  ExternalLink,
  PenLine,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Play,
  Pin,
  PinOff,
  Download,
  BrainCircuit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { usePersistentLive } from "@/features/classes/hooks/use-persistent-live";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { offlineDB as db } from "@/lib/offline-db";
import { CinematicArchitectModal } from "@/features/ai/components/cinematic-architect-modal";

interface ResourceItemProps {
  res: Resource;
  classId: string;
  isTeacher: boolean;
  onDelete: (id: number) => void;
  onToggleAiPin: (res: Resource) => void;
  onFeature: (id: number) => void;
}

export const ResourceItem = ({
  res,
  classId,
  isTeacher,
  onDelete,
  onToggleAiPin,
  onFeature,
}: ResourceItemProps) => {
  const { t, i18n } = useTranslation();
  const { setActiveVideo } = usePersistentLive();
  const { downloadLesson } = useOfflineSync();
  const isAr = i18n.language === "ar";
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);

  const handleOpenResource = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. Check for local blob cache
    try {
      const cachedBlob = await db.attachment_blobs.get({ resourceId: String(res.id) });
      if (cachedBlob) {
        const localUrl = URL.createObjectURL(cachedBlob.blob);
        window.open(localUrl, "_blank");
        return;
      }
    } catch (err) {
      console.warn("Failed to check offline cache:", err);
    }

    // 2. Fallback to network URL
    if (res.url) {
      window.open(res.url, "_blank");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-black/3 dark:border-white/3 bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer group/item">
      <CinematicArchitectModal
        isOpen={isArchitectOpen}
        onClose={() => setIsArchitectOpen(false)}
        resourceId={String(res.id)}
      />
      <div className="flex items-center gap-4 overflow-hidden">
        <div
          className={cn(
            "p-2.5 rounded-xl shrink-0 transition-transform group-hover/item:scale-110",
            res.type === "video"
              ? "bg-blue-500/10 text-blue-500"
              : res.type === "link"
                ? "bg-success/10 text-success"
                : res.type === "note"
                  ? "bg-purple-500/10 text-purple-500"
                  : res.type === "image"
                    ? "bg-pink-500/10 text-pink-500"
                    : "bg-orange-500/10 text-orange-500"
          )}
        >
          {res.type === "video" ? (
            <Video className="h-4 w-4" />
          ) : res.type === "link" ? (
            <LinkIcon className="h-4 w-4" />
          ) : res.type === "note" ? (
            <PenLine className="h-4 w-4" />
          ) : res.type === "image" ? (
            <ImageIcon className="h-4 w-4" />
          ) : (
            <File className="h-4 w-4" />
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight group-hover/item:text-primary transition-colors truncate">
              {res.title}
            </span>
            {res.isAiPinned && <Pin className="h-3 w-3 text-ai-primary fill-ai-primary" />}
          </div>
          {res.description && (
            <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest truncate">
              {res.description}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isTeacher && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-none shadow-2xl p-2 min-w-[180px] bg-card/95 backdrop-blur-xl"
            >
              <DropdownMenuItem
                className={cn(
                  "rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 py-3 cursor-pointer transition-all",
                  res.isAiPinned
                    ? "text-muted-foreground hover:bg-muted"
                    : "text-ai-primary hover:bg-ai-primary/10"
                )}
                onClick={() => onToggleAiPin(res)}
              >
                {res.isAiPinned ? (
                  <>
                    <PinOff className="h-3.5 w-3.5" />
                    Unpin from AI
                  </>
                ) : (
                  <>
                    <Pin className="h-3.5 w-3.5" />
                    Pin to AI Context
                  </>
                )}
              </DropdownMenuItem>
              {isTeacher && (
                <DropdownMenuItem
                  className="rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 py-3 cursor-pointer text-purple-600 hover:bg-purple-50 transition-all"
                  onClick={() => setIsArchitectOpen(true)}
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Draft Course with AI
                </DropdownMenuItem>
              )}
              {res.type === "video" && (
                <DropdownMenuItem
                  className="rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 py-3 cursor-pointer text-ai-primary hover:bg-ai-primary/10 transition-all"
                  onClick={() => onFeature(res.id)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("buttons.featureOnTv")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="rounded-lg font-black uppercase tracking-widest text-[10px] md:text-[11px] gap-2 py-3 cursor-pointer text-destructive hover:bg-destructive/10 transition-all"
                onClick={() => onDelete(res.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("buttons.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {res.type === "note" ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
              onClick={(e) => {
                e.stopPropagation();
                downloadLesson(res);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 text-primary hover:bg-primary/10 transition-all"
            >
              <Link to={`/classes/${classId}/lessons/${res.id}`}>
                <ExternalLink className="h-3.5 w-3.5" />
                {t("buttons.openLesson")}
                <ArrowRight
                  className={cn(
                    "h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-all",
                    isAr
                      ? "translate-x-2 group-hover:translate-x-0 rotate-180"
                      : "-translate-x-2 group-hover:translate-x-0"
                  )}
                />
              </Link>
            </Button>
          </div>
        ) : res.type === "video" ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
              onClick={(e) => {
                e.stopPropagation();
                downloadLesson(res);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 text-blue-500 hover:bg-blue-500/10 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (res.url) {
                  setActiveVideo(res.url, res.title);
                }
              }}
            >
              <Play className="h-3.5 w-3.5 fill-blue-500" />
              {t("buttons.watchNow")}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenResource}
            className="h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-muted transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("buttons.view")}
          </Button>
        )}
        {isTeacher && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive/5"
            onClick={() => onDelete(res.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
