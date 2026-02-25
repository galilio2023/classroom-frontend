import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/empty-state";
import { DashboardBadge } from "./dashboard-badge";
import { PendingSubmission } from "@/types/dashboard";

interface PendingGradingListProps {
  submissions: PendingSubmission[];
  show: (resource: string, id: string) => void;
}

export const PendingGradingList = ({ submissions, show }: PendingGradingListProps) => (
    <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl group">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/5 dark:border-white/5 pb-6 gap-4">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    Pending Grading
                </CardTitle>
                <CardDescription className="text-sm font-medium">Evaluate student submissions.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="pt-8">
            {submissions.length > 0 ? (
                <div className="space-y-4">
                    {submissions.map((submission) => (
                        <div 
                            key={submission.id} 
                            className="group/item flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-[1.01] transition-all cursor-pointer shadow-sm gap-4"
                            onClick={() => show("assignments", submission.assignmentId)}
                        >
                            <div className="flex items-center gap-5">
                                <Avatar className="h-12 w-12 md:h-14 md:w-14 border-4 border-white dark:border-white/10 shadow-md">
                                    <AvatarImage src={submission.student?.image || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">{submission.student?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <span className="font-black text-base md:text-lg group-hover/item:text-primary transition-colors">{submission.student?.name}</span>
                                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                        {submission.assignment?.title}
                                    </span>
                                </div>
                            </div>
                            <DashboardBadge variant="outline" className="w-fit rounded-full px-4 py-1 bg-white/50 dark:bg-black/20 font-bold">
                                {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                            </DashboardBadge>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState icon={CheckCircle2} title="Inbox Zero!" description="All submissions graded." />
            )}
        </CardContent>
    </Card>
);
