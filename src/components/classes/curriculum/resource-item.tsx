import { Resource, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        "flex flex-col p-2 rounded-md border transition-colors",
        completed ? "bg-green-50/50 border-green-100 dark:bg-green-950/10 dark:border-green-900/30" : "bg-muted/30 hover:bg-muted/50"
    )}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
                {isStudent && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 shrink-0"
                        onClick={() => onToggleProgress(resource.id)}
                    >
                        {completed ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                )}
                {resource.type === 'video' ? <Video className="h-4 w-4 shrink-0 text-blue-500" /> : 
                resource.type === 'link' ? <LinkIcon className="h-4 w-4 shrink-0 text-green-500" /> : 
                resource.type === 'note' ? <PenLine className="h-4 w-4 shrink-0 text-purple-500" /> :
                <File className="h-4 w-4 shrink-0 text-orange-500" />}
                <span className={cn("text-sm truncate font-medium", completed && "text-green-700 dark:text-green-400")}>
                    {resource.title}
                </span>
            </div>
            <div className="flex items-center gap-1">
                {resource.type === 'note' ? (
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs gap-1.5 text-primary hover:bg-primary/10">
                        <Link to={`/classes/${classId}/lessons/${resource.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            Read
                        </Link>
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                        <a href={resource.url} target="_blank" rel="noreferrer">View</a>
                    </Button>
                )}
            </div>
        </div>
        {resource.type === 'note' && resource.content && (
            <div className="mt-2 text-xs prose prose-sm dark:prose-invert max-w-none line-clamp-2 opacity-80">
                <ReactMarkdown>{resource.content}</ReactMarkdown>
            </div>
        )}
    </div>
  );
};
