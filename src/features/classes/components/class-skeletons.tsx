import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ClassHeaderSkeleton = () => (
  <div className="flex items-center justify-between px-2 mb-8">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-8 w-48 rounded-lg" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24 rounded-xl" />
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
  </div>
);

export const ClassBannerSkeleton = () => (
  <Card className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden border-none mb-8">
    <Skeleton className="absolute inset-0 h-full w-full" />
    <div className="absolute bottom-8 left-8 space-y-3 z-10">
      <Skeleton className="h-10 w-64 rounded-xl bg-white/20" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
        <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
      </div>
    </div>
  </Card>
);

export const TabsNavigationSkeleton = () => (
  <div className="bg-muted/10 border border-border/40 rounded-[2.5rem] p-2 mb-8">
    <div className="flex gap-2 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-12 w-32 rounded-full flex-shrink-0" />
      ))}
    </div>
  </div>
);

export const ClassShowSkeleton = () => (
  <div className="space-y-8 md:space-y-12 pb-20 max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 mt-8">
    <ClassHeaderSkeleton />
    <ClassBannerSkeleton />
    <TabsNavigationSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full rounded-[2rem]" />
        <Skeleton className="h-64 w-full rounded-[2rem]" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-[2rem]" />
        <Skeleton className="h-96 w-full rounded-[2rem]" />
      </div>
    </div>
  </div>
);
