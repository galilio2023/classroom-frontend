import React from "react";
import { useList, useNavigation, useTranslate } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Plus, Search, Users, Trophy, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function BadgesList() {
  const t = useTranslate();
  const { create } = useNavigation();
  const { isStaff: isTeacher, isAdmin } = useUserRole();

  const { data, isLoading } = useList({
    resource: "badges",
    sorters: [{ field: "createdAt", order: "desc" }],
  });

  const badges = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            {t("resources.badges.label")}
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage and view gamification achievements across the platform.
          </p>
        </div>
        {(isTeacher || isAdmin) && (
          <Button
            onClick={() => create("badges")}
            className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Create New Badge
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge: any) => (
          <Card
            key={badge.id}
            className="group overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-xl"
          >
            <div className="h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl group-hover:blur-3xl transition-all scale-150 opacity-0 group-hover:opacity-100" />
                <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-xl relative z-10">
                  <AvatarImage src={badge.iconUrl} alt={badge.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <Award className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">{badge.name}</CardTitle>
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-primary/60 mt-1">
                {badge.criteria?.type || "General Achievement"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-center font-medium leading-relaxed text-muted-foreground line-clamp-2">
                {badge.description || "No description provided for this achievement."}
              </p>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-muted p-1.5 rounded-lg text-muted-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                      Earned By
                    </span>
                    <span className="text-sm font-bold leading-none">-- Students</span>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-lg border-2 font-bold px-3">
                  <ShieldCheck className="h-3 w-3 me-1 text-green-500" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {badges.length === 0 && (
        <Card className="border-dashed py-24 flex flex-col items-center justify-center text-center bg-muted/5 rounded-3xl">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Trophy className="h-12 w-12 text-primary opacity-50" />
          </div>
          <CardTitle className="text-2xl font-black">No Badges Created</CardTitle>
          <CardDescription className="max-w-xs mt-2 font-medium text-base">
            Start rewarding your students by creating your first achievement badge!
          </CardDescription>
          {(isTeacher || isAdmin) && (
            <Button
              onClick={() => create("badges")}
              variant="outline"
              className="mt-8 rounded-xl font-bold border-2"
            >
              Create First Badge
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
