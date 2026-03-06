import { useList } from "@refinedev/core";
import { Enrollment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLevelProgress } from "@/lib/xp";

interface LeaderboardTabProps {
  classId: string;
}

export function LeaderboardTab({ classId }: LeaderboardTabProps) {
  const { query } = useList<Enrollment>({
    resource: "enrollments",
    filters: [
      { field: "classId", operator: "eq", value: classId },
      { field: "status", operator: "eq", value: "approved" }
    ],
    pagination: { mode: "off" }
  });

  const { data, isLoading } = query;

  const students = data?.data.map((e: Enrollment) => e.student) || [];
  
  // Sort by XP descending
  const rankedStudents = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-slate-400 fill-slate-400" />;
      case 2: return <Medal className="h-6 w-6 text-amber-600 fill-amber-600" />;
      default: return <span className="text-lg font-black text-muted-foreground/40">#{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top 3 Podium */}
        {rankedStudents.slice(0, 3).map((student, index) => {
          const { currentLevel } = getLevelProgress(student.xp || 0);
          return (
            <Card key={student.id} className={cn(
              "relative overflow-hidden border-none shadow-xl",
              index === 0 ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 md:scale-105 z-10" : "bg-muted/30"
            )}>
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <Avatar className={cn(
                    "h-20 w-20 border-4",
                    index === 0 ? "border-yellow-500 shadow-yellow-500/20" : 
                    index === 1 ? "border-slate-400" : "border-amber-600"
                  )}>
                    <AvatarImage src={student.image || ""} />
                    <AvatarFallback className="text-xl font-bold">{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-4 -right-4">
                    {getRankIcon(index)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-black tracking-tight text-lg">{student.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest">
                      Level {currentLevel}
                    </Badge>
                    <div className="flex items-center gap-1 text-gold-primary">
                      <Zap className="h-3 w-3 fill-gold-primary" />
                      <span className="text-sm font-black">{student.xp || 0} XP</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Class Rankings
          </CardTitle>
          <CardDescription>Ranked by total experience points earned</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {rankedStudents.map((student, index) => {
              const { currentLevel } = getLevelProgress(student.xp || 0);
              return (
                <div key={student.id} className={cn(
                  "flex items-center justify-between p-4 transition-colors hover:bg-muted/20",
                  index < 3 && "bg-primary/5"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={student.image || ""} />
                      <AvatarFallback className="font-bold">{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">{student.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Level {currentLevel}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-gold-primary/10 px-3 py-1 rounded-full border border-gold-primary/20">
                    <Zap className="h-3 w-3 text-gold-primary fill-gold-primary" />
                    <span className="text-sm font-black text-gold-primary">{student.xp || 0}</span>
                    <span className="text-[10px] font-bold text-gold-primary/60 uppercase tracking-tighter">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
