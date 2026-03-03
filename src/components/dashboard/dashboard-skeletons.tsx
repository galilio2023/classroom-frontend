import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const WelcomeHeaderSkeleton = () => (
  <div className="flex flex-col gap-2 mb-8">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-4 w-48" />
  </div>
);

export const ChartSkeleton = () => (
  <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-8 w-20" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </Card>
      ))}
    </div>
  </div>
);

export const ScheduleSkeleton = () => (
  <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export const StatsSkeleton = () => (
  <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </CardContent>
  </Card>
);
