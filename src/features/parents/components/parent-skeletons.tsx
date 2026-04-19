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

export const ChildCardSkeleton = () => (
  <SkeletonWrapper>
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
      <CardHeader className="bg-muted/30 pb-8 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-10 rounded-lg" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded-lg" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 space-y-6">
        <div className="p-5 rounded-3xl bg-muted/20 border border-border/40 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-[80%] rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardContent>
    </Card>
  </SkeletonWrapper>
);
