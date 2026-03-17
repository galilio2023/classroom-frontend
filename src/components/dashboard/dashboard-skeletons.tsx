import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

const SkeletonWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const WelcomeHeaderSkeleton = () => (
  <SkeletonWrapper>
    <div className="flex flex-col gap-4 mb-10 text-start">
      <Skeleton className="h-10 md:h-12 w-[70%] md:w-64 rounded-2xl" />
      <div className="flex items-center gap-3">
         <Skeleton className="h-8 w-8 rounded-lg" />
         <Skeleton className="h-4 w-[40%] md:w-48" />
      </div>
    </div>
  </SkeletonWrapper>
);

export const ChartSkeleton = () => (
  <SkeletonWrapper>
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-2xl rounded-[2rem] overflow-hidden text-start">
      <CardHeader className="p-8 pb-4">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="p-8 pt-2">
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </CardContent>
    </Card>
  </SkeletonWrapper>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <SkeletonWrapper>
    <div className="space-y-6 text-start">
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="p-8 space-y-6 border-none shadow-xl bg-card/50 backdrop-blur-2xl rounded-[2rem]">
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
            <div className="pt-4 border-t border-black/[0.03] dark:border-white/[0.03]">
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  </SkeletonWrapper>
);

export const ScheduleSkeleton = () => (
  <SkeletonWrapper>
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-2xl rounded-[2rem] overflow-hidden text-start">
      <CardHeader className="p-8 pb-4">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="p-8 pt-2 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  </SkeletonWrapper>
);

export const StatsSkeleton = () => (
  <SkeletonWrapper>
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-2xl rounded-[2rem] overflow-hidden text-start">
      <CardHeader className="p-8 pb-4">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="p-8 pt-2 grid grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-8 w-12 rounded-lg" />
          </div>
        ))}
      </CardContent>
    </Card>
  </SkeletonWrapper>
);
