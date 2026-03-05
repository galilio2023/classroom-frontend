import { Resource } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Link as LinkIcon, 
  PenLine, 
  File, 
  Eye, 
  CheckCircle2, 
  Circle 
} from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ResourceItemProps {
  resource: Resource;
  isStudent: boolean;
  completed: boolean;
  classId: string;
  onToggleProgress: (id: number) => void;
}

export const ResourceItem = ({ 
  resource, 
  isStudent, 
  completed, 
  classId, 
  onToggleProgress 
}: ResourceItemProps) => {
  return (
    <div className={cn(
        "flex flex-col p-3 rounded-md border transition-colors",
        completed ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50" : "bg-muted/30 hover:bg-muted/50"
    )}>
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                {isStudent && (
                    <button 
                        onClick={() => onToggleProgress(resource.id)}
                        className="shrink-0 focus:outline-none"
                    >
                        {completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                    </button>
                )}
                
                <div className="flex items-center gap-2 min-w-0">
                    {resource.type === 'video' ? <Video className="h-4 w-4 shrink-0 text-blue-500" /> : 
                     resource.type === 'link' ? <LinkIcon className="h-4 w-4 shrink-0 text-green-500" /> : 
                     resource.type === 'note' ? <PenLine className="h-4 w-4 shrink-0 text-purple-500" /> :
                     <File className="h-4 w-4 shrink-0 text-orange-500" />}
                    
                    <span className={cn(
                        "text-sm font-medium truncate",
                        completed && "text-green-700 dark:text-green-400 line-through decoration-green-500/50"
                    )}>
                        {resource.title}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {resource.type === 'note' ? (
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs gap-1.5 text-primary hover:bg-primary/10">
                        <Link to={`/classes/${classId}/lessons/${resource.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            Read
                        </Link>
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                        <a href={resource.url} target="_blank" rel="noreferrer">View</a>
                    </Button>
                )}
            </div>
        </div>
        
        {resource.type === 'note' && resource.content && (
            <div className="mt-2 pl-8 text-xs text-muted-foreground line-clamp-2">
                <div className="prose prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown>
                        {resource.content}
                    </ReactMarkdown>
                </div>
            </div>
        )}
    </div>
  );
};
