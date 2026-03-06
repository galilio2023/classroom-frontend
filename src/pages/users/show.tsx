import { useShow, useGetIdentity } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Shield, FileText, Loader2, Trophy, Zap, Award, Star, Flame, Target } from "lucide-react";
import { User as UserType, UserRole } from "@/types";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { BadgeCard, MOCK_BADGES } from "@/components/badge-card";

const UserShow = () => {
  const { id } = useParams();
  const { data: identity } = useGetIdentity<UserType>();
  
  const { query } = useShow<UserType & { phoneNumber?: string; address?: string; bio?: string }>({
    resource: "users",
    id,
  });

  const { data, isLoading, isError } = query;
  const user = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <ShowView>
        <ShowViewHeader title="User not found" />
      </ShowView>
    );
  }

  const isSelf = identity?.id === user.id;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isStudent = user.role === UserRole.STUDENT;
  
  const { currentLevel, xpInCurrentLevel, xpRequiredForNextLevel } = getLevelProgress(user.xp || 0);

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-4 space-y-6">
          <Card className="overflow-hidden border-primary/10 shadow-lg">
            <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
            <CardContent className="relative pt-0 flex flex-col items-center text-center">
              <Avatar className="h-28 w-28 border-4 border-background -mt-14 shadow-xl">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 space-y-1">
                <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
                <Badge variant="secondary" className="capitalize font-bold px-3">
                  {user.role}
                </Badge>
              </div>
              
              {isStudent && (
                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-primary">{currentLevel}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Level</span>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-primary">{user.xp || 0}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Total XP</span>
                    </div>
                  </div>
                  <XPProgressBar xp={user.xp || 0} />
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-muted rounded-md"><Mail className="h-4 w-4 text-primary" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Email</span>
                    <span className="font-medium truncate max-w-[180px]">{user.email}</span>
                  </div>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-muted rounded-md"><Phone className="h-4 w-4 text-primary" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Phone</span>
                      <span className="font-medium">{user.phoneNumber}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-muted rounded-md"><Calendar className="h-4 w-4 text-primary" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Joined</span>
                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Bio */}
        <div className="md:col-span-8 space-y-6">
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>About</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Biography</h4>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {user.bio || "No biography provided yet."}
                </p>
              </div>

              {user.address && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Location</h4>
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{user.address}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isStudent && (
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gold-primary" />
                  <CardTitle>Badges & Achievements</CardTitle>
                </div>
                <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest">
                  {MOCK_BADGES.filter(b => b.unlocked).length} / {MOCK_BADGES.length} Earned
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {MOCK_BADGES.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(isSelf || isAdmin) && (
            <div className="pt-6">
              <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                Private Information - Only visible to you and administrators
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserShow;
