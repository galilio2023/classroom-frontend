import React from "react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
  ToggleRight,
  Search,
  Filter,
  Settings,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";
import { toast } from "sonner";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

interface FeatureFlag {
  id: string;
  key: string;
  isEnabled: boolean;
  description: string;
  targetingRules: any;
  updatedAt: string;
}

const FeatureFlagsListPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useCapabilities();

  const { query } = useCustom<FeatureFlag[]>({
    url: `${import.meta.env.VITE_API_URL}/admin/feature-flags`,
    method: "get",
  });

  const { data: queryData, isLoading, refetch } = query;

  const { mutate: updateFlag } = useCustomMutation();

  const handleToggle = (flag: FeatureFlag, checked: boolean) => {
    updateFlag(
      {
        url: `${import.meta.env.VITE_API_URL}/admin/feature-flags/${flag.id}`,
        method: "patch",
        values: { isEnabled: checked },
      },
      {
        onSuccess: () => {
          toast.success(`Feature '${flag.key}' ${checked ? "enabled" : "disabled"} globally.`);
          refetch();
        },
        onError: () => {
          toast.error("Failed to update feature flag.");
        },
      }
    );
  };

  if (!isAdmin) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-destructive">
        Unauthorized Access
      </div>
    );
  }

  const flags = queryData?.data || [];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-primary/10 text-primary shadow-sm border border-primary/5">
            <ToggleRight className="h-8 w-8" />
          </div>
          <div className="text-start">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none">
              Feature Control
            </h1>
            <p className="text-muted-foreground font-medium mt-1.5 uppercase tracking-widest text-[10px]">
              Centralized Dynamic Capabilities & Targeting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[9px] gap-2 border-border/60"
          >
            <RefreshCw className="h-4 w-4" />
            Reload State
          </Button>
          <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[9px] gap-2 shadow-xl shadow-primary/20">
            <Zap className="h-4 w-4" />
            Push Deploy
          </Button>
        </div>
      </div>

      {/* Flag Table */}
      <Card className="rounded-[2.5rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Feature Identity
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Strategic Description
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Targeting
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Status
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Last Sync
                </TableHead>
                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-[10px]">
                  Override
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/20">
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-48" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-64" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <Skeleton className="h-10 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : flags.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {flags.map((flag: FeatureFlag, idx: number) => (
                    <motion.tr
                      key={flag.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-border/20 group hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-3">
                          <code className="text-xs font-black bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 uppercase tracking-tighter">
                            {flag.key}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <p className="text-sm font-bold text-muted-foreground leading-snug">
                          {flag.description || "No description provided."}
                        </p>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <Badge
                          variant="outline"
                          className="rounded-full px-3 py-1 border-border/60 text-[9px] font-black uppercase tracking-widest gap-2"
                        >
                          <Globe className="h-3 w-3" />
                          Global
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <Badge
                          className={cn(
                            "rounded-full px-4 py-1.5 border-none font-black text-[9px] uppercase tracking-widest",
                            flag.isEnabled
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {flag.isEnabled ? "Operational" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase">
                          <LayoutGrid className="h-3.5 w-3.5" />
                          {dayjs(flag.updatedAt).format("MMM DD, HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            {flag.isEnabled ? "ON" : "OFF"}
                          </span>
                          <Switch
                            checked={flag.isEnabled}
                            onCheckedChange={(val) => handleToggle(flag, val)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-8 rounded-full bg-muted/10 text-muted-foreground/20">
                        <ToggleRight className="h-16 w-16" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase italic text-muted-foreground/40">
                          No feature flags configured
                        </h3>
                        <p className="text-sm text-muted-foreground/30 font-medium">
                          Define capabilities in the database to manage them here.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagsListPage;
