import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, Bell, Info, GraduationCap, CheckCheck, ClipboardCheck, Trophy, BrainCircuit, Trash2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useDelete, useGetIdentity, useCustomMutation, useInvalidate } from "@refinedev/core";
import { Notification, User, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

const NotificationsListPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const { mutate: deleteMutation } = useDelete();
  const { mutate: markAsRead } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleMarkAsRead = (id: number) => {
    markAsRead({
        url: `/notifications/${id}/read`,
        method: "patch",
        values: { id },
    }, {
        onSuccess: () => {
            toast.success("Notification marked as read");
            invalidate({
                resource: "notifications",
                invalidates: ["list"],
            });
        }
    });
  };

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "title", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "grade": return <CheckCheck className="h-4 w-4 text-green-500" />;
      case "attendance": return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
      case "achievement": return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "agent_alert": return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const notificationTable = useTable<Notification>({
    columns: useMemo<ColumnDef<Notification>[]>(
      () => [
        {
          accessorKey: "title",
          header: () => <p className="column-title">Notification</p>,
          cell: ({ getValue, row }) => (
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg border shadow-sm mt-0.5",
                !row.original.isRead ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50"
              )}>
                {getIcon(row.original.type)}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={cn(
                  "text-sm",
                  !row.original.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                )}>
                  {getValue<string>()}
                </span>
                <p className="text-xs text-muted-foreground line-clamp-1">{row.original.message}</p>
              </div>
            </div>
          ),
        },
        {
          accessorKey: "type",
          header: () => <p className="column-title">Type</p>,
          cell: ({ getValue }) => (
            <Badge variant="outline" className="capitalize text-[10px] font-black uppercase tracking-tighter">
              {getValue<string>()}
            </Badge>
          )
        },
        {
          accessorKey: "isRead",
          header: () => <p className="column-title">Status</p>,
          cell: ({ getValue }) => (
            <Badge variant={getValue<boolean>() ? "secondary" : "default"} className="text-[10px]">
              {getValue<boolean>() ? "Read" : "Unread"}
            </Badge>
          )
        },
        {
          accessorKey: "createdAt",
          header: () => <p className="column-title">Date</p>,
          cell: ({ getValue }) => (
            <span className="text-xs text-muted-foreground font-medium">
              {format(new Date(getValue<string>()), "MMM d, yyyy HH:mm")}
            </span>
          )
        },
        {
          id: "actions",
          size: 100,
          header: () => <p className="column-title text-right pr-4">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              {!row.original.isRead && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-green-600"
                  onClick={() => handleMarkAsRead(row.original.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive"
                onClick={() => {
                    if (confirm("Delete this notification?")) {
                        deleteMutation({
                            resource: "notifications",
                            id: row.original.id,
                        });
                    }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        },
      ],
      [deleteMutation]
    ),
    refineCoreProps: {
      resource: "notifications",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  });

  const hasData = (notificationTable.refineCore.tableQuery.data?.data?.length || 0) > 0;
  const isLoading = notificationTable.refineCore.tableQuery.isLoading;

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Notifications</h1>
      <div className="intro-row">
        <p>Stay updated with the latest class activities, grades, and system alerts.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search notifications..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAdmin && <CreateButton />}
        </div>
      </div>
      
      {!isLoading && !hasData ? (
        <div className="mt-8">
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You don't have any notifications at the moment."
          />
        </div>
      ) : (
        <DataTable table={notificationTable} />
      )}
    </ListView>
  );
};

export default NotificationsListPage;
