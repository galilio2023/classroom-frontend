import { useGetIdentity, useCustom } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trophy, Award, Star, Flame, Target, TrendingUp, BookOpen, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { User as UserType, UserRole } from "@/types";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { BadgeCard, MOCK_BADGES } from "@/components/badge-card";
import { StudentAcademicJourney } from "@/components/dashboard/student-academic-journey";
import { SubmissionHeatmap } from "@/components/dashboard/submission-heatmap";

const StudentPortfolio = () => {
  const { id } = useParams();
  const { data: identity } = useGetIdentity<UserType>();
  
  const studentId = id || identity?.id;

  const { query: userQuery } = useCustom<UserType>({
    url: `/users/${studentId}`,
    method: "get",
  });

  const { data: userData, isLoading: isUserLoading } = userQuery;

  const { query: analyticsQuery } = useCustom<any>({
    url: `/users/${studentId}/portfolio-analytics`,
    method: "get",
    queryOptions: {
      enabled: !!studentId,
    }
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = analyticsQuery;

  const user = userData?.data;
  const analytics = analyticsData?.data;

  if (isUserLoading || isAnalyticsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground text-lg">Student not found</p>
      </div>
    );
  }

  const { currentLevel } = getLevelProgress(user.xp || 0);

  return (
    <div className="container mx-auto py-10 max-w-6xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="w-full md:w-1/3 overflow-hidden border-primary/10 shadow-lg">
          <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5" />
          <CardContent className="relative pt-0 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-background -mt-12 shadow-xl">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="capitalize font-bold px-3">
                  Level {currentLevel}
                </Badge>
                <Badge variant="outline" className="font-bold px-3">
                  {user.xp || 0} XP
                </Badge>
              </div>
            </div>
            
            <div className="w-full mt-6">
              <XPProgressBar xp={user.xp || 0} />
            </div>
            
            <Separator className="my-6" />
            
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium truncate">{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium">{user.phoneNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 flex flex-col items-center justify-center text-center border-primary/10">
              <Trophy className="h-6 w-6 text-gold-primary mb-2" />
              <span className="text-2xl font-black">{analytics?.totalBadges || 0}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Badges</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center border-primary/10">
              <Target className="h-6 w-6 text-primary mb-2" />
              <span className="text-2xl font-black">{analytics?.avgGrade || 0}%</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Avg Grade</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center border-primary/10">
              <Flame className="h-6 w-6 text-orange-500 mb-2" />
              <span className="text-2xl font-black">{analytics?.streak || 0}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Day Streak</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center border-primary/10">
              <Star className="h-6 w-6 text-yellow-500 mb-2" />
              <span className="text-2xl font-black">{analytics?.rank || "N/A"}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Global Rank</span>
            </Card>
          </div>

          <SubmissionHeatmap data={analytics?.submissionHeatmap || []} />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Academic Journey</h3>
        </div>
        
        <StudentAcademicJourney 
          gradeTrends={analytics?.gradeTrends || []}
          subjectMastery={analytics?.subjectMastery || []}
          attendanceSummary={analytics?.attendanceSummary || {}}
        />
      </div>

      {/* Badges Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-gold-primary" />
            <h3 className="text-xl font-bold">Unlocked Achievements</h3>
          </div>
          <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest">
            {MOCK_BADGES.filter(b => b.unlocked).length} / {MOCK_BADGES.length} Earned
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_BADGES.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
