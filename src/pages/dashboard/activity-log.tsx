import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, Activity, User, ShieldCheck, ShieldAlert, Building2, BookOpen, GraduationCap, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { AiLog, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ActivityLogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "action", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const getActionIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("verify") || a.includes("approve")) return <ShieldCheck className="h-4 w-4 text-green-500" />;
    if (a.includes("reject") || a.includes("delete")) return <ShieldAlert className="h-4 w-4 text-destructive" />;
    if (a.includes("user")) return <User className="h-4 w-4 text-blue-500" />;
    if (a.includes("dept") || a.includes("department")) return <Building2 className="h-4 w-4 text-purple-500" />;
    if (a.includes("class")) return <GraduationCap className="h-4 w-4 text-orange-500" />;
    if (a.includes("subject")) return <BookOpen className="h-4 w-4 text-indigo-500" />;
    if (a.includes("assignment") || a.includes("grade")) return <FileText className="h-4 w-4 text-emerald-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const activityTable = useTable<AiLog>({
    columns: useMemo<ColumnDef<AiLog>[]>(
      () => [
        {
          accessorKey: "user",
          header: () => <p className="column-title">Admin / User</p>,
          cell: ({ row }) => {
            const user = row.original.user;
            if (!user) return <span className="text-xs text-muted-foreground italic">System</span>;
            return (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">{user.role}</span>
                </div>
              </div>
            );
          }
        },
        {
          accessorKey: "action",
          header: () => <p className="column-title">Action</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted/50 border border-border/50">
                {getActionIcon(getValue<string>())}
              </div>
              <Badge variant="outline" className="capitalize text-[10px] font-black tracking-tight bg-background">
                {getValue<string>().replace(/_/g, " ")}
              </Badge>
            </div>
          )
        },
        {
          accessorKey: "metadata",
          header: () => <p className="column-title">Details</p>,
          cell: ({ getValue }) => {
            const metadata = getValue<any>();
            if (!metadata) return <span className="text-xs text-muted-foreground">-</span>;
            
            // Try to extract a human-readable summary from metadata
            const details = metadata.name || metadata.title || metadata.email || JSON.stringify(metadata).substring(0, 50) + "...";
            
            return (
              <div className="flex flex-col gap-1 max-w-[300px]">
                <span className="text-xs font-medium truncate">{details}</span>
                {metadata.reason && <span className="text-[10px] text-destructive italic">Reason: {metadata.reason}</span>}
              </div>
            );
          }
        },
        {
          accessorKey: "createdAt",
          header: () => <p className="column-title">Timestamp</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="h-3 w-3" />
              {format(new Date(getValue<string>()), "MMM d, HH:mm:ss")}
            </div>
          )
        }
      ],
      []
    ),
    refineCoreProps: {
      resource: "ai-logs", // Reusing ai-logs for general activity tracking
      pagination: { pageSize: 15, mode: "server" },
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
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <h1 className="page-title mb-0">Admin Activity Log</h1>
      </div>
      <div className="intro-row">
        <p>Audit trail of all administrative actions, verifications, and system changes.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Filter by action (e.g. verify, delete)..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DataTable table={activityTable} />
    </ListView>
  );
};

export default ActivityLogPage;
