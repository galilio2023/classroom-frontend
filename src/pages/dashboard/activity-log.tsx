import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, Shield, Database, Globe, Clock } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { ActivityLog } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { enUS, ar } from "date-fns/locale";

const actionVariants: Record<string, string> = {
  CREATE_CLASS: "bg-green-500/10 text-green-600 border-green-200",
  DELETE_CLASS: "bg-red-500/10 text-red-600 border-red-200",
  JOIN_CLASS: "bg-blue-500/10 text-blue-600 border-blue-200",
  APPROVE_ENROLLMENT: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  SUBMIT_ASSIGNMENT: "bg-purple-500/10 text-purple-600 border-purple-200",
  GRADE_SUBMISSION: "bg-amber-500/10 text-amber-600 border-amber-200",
  USER_LOGIN: "bg-slate-500/10 text-slate-600 border-slate-200",
};

const ActivityLogPage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const isArabic = i18n.language === 'ar';

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "action", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const table = useTable<ActivityLog>({
    columns: useMemo<ColumnDef<ActivityLog>[]>(
      () => [
        {
          id: "user",
          header: () => <p className="column-title">{t("auth.register.accountSetup")}</p>,
          cell: ({ row }) => {
            const user = row.original.user;
            return (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.image ?? ""} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-xs font-bold">{user?.name || "System"}</span>
                    <span className="text-[10px] text-muted-foreground">{user?.email}</span>
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "action",
          header: () => <p className="column-title">{t("dashboard.activity.recent")}</p>,
          cell: ({ getValue }) => {
            const action = getValue<string>();
            return (
              <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-wider border-none", actionVariants[action])}>
                {t(`activity.actions.${action}`, action.replace("_", " "))}
              </Badge>
            );
          },
        },
        {
          id: "details",
          header: () => <p className="column-title">{t("common.details")}</p>,
          cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
              <Database className="h-3 w-3" />
              <span className="capitalize">{row.original.entityType || "N/A"}</span>
              <span className="opacity-40">ID: {row.original.entityId || "-"}</span>
            </div>
          )
        },
        {
          id: "network",
          header: () => <p className="column-title">{t("dashboard.activity.network" as any)}</p>,
          cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                    <Globe className="h-2.5 w-2.5" />
                    {row.original.ipAddress || "Local"}
                </div>
                <div className="text-[8px] text-muted-foreground/60 truncate max-w-[150px]">
                    {row.original.userAgent}
                </div>
            </div>
          )
        },
        {
          accessorKey: "createdAt",
          header: () => <p className="column-title">{t("common.certificate.date")}</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(new Date(getValue<string>()), { 
                addSuffix: true,
                locale: isArabic ? ar : enUS
              })}</span>
            </div>
          ),
        },
      ],
      [t, isArabic],
    ),
    refineCoreProps: {
      resource: "activity-log",
      pagination: { pageSize: 20, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
      meta: {
        populate: ["user"]
      }
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            {t("resources.activity-log.label")}
          </h1>
          <p className="text-muted-foreground">{t("users.governance.description")}</p>
        </div>
      </div>

      <div className="intro-row bg-muted/30 p-4 rounded-2xl mb-6">
        <div className="search-field max-w-md">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder={t("common.search")}
            className="pl-10 w-full h-11 rounded-xl bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable table={table} />
    </ListView>
  );
};

export default ActivityLogPage;
