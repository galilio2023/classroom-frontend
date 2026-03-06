import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, MessageSquare, LayoutGrid, User, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Discussion, User as UserType, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";

const DiscussionsListPage = () => {
  const { data: identity } = useGetIdentity<UserType>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const { show, create } = useNavigation();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "content", operator: "contains" as const, value: searchQuery });
    }
    // Only show top-level discussions (not replies)
    f.push({ field: "parentId", operator: "null" as const, value: true });
    return f;
  }, [searchQuery]);

  const discussionTable = useTable<Discussion>({
    columns: useMemo<ColumnDef<Discussion>[]>(
      () => [
        {
          accessorKey: "content",
          header: () => <p className="column-title">Topic / Content</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground font-medium line-clamp-1 max-w-[300px]">{getValue<string>()}</span>
          ),
        },
        {
          accessorKey: "user",
          header: () => <p className="column-title">Author</p>,
          cell: ({ getValue }) => {
            const user = getValue<Discussion["user"]>();
            return (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{user.name}</span>
              </div>
            );
          }
        },
        {
          accessorKey: "class.name",
          header: () => <p className="column-title">Class</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs">{getValue<string>() || "N/A"}</span>
            </div>
          )
        },
        {
          id: "replies",
          header: () => <p className="column-title">Replies</p>,
          cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{row.original.replies?.length || 0}</span>
            </div>
          )
        },
        {
          accessorKey: "updatedAt",
          header: () => <p className="column-title">Last Activity</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(getValue<string>()), "MMM d, HH:mm")}</span>
            </div>
          )
        },
        {
          id: "actions",
          size: 100,
          header: () => <p className="column-title text-right pr-4">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1.5"
                onClick={() => show("discussions", row.original.id)}
              >
                View Thread
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ),
        },
      ],
      [show],
    ),
    refineCoreProps: {
      resource: "discussions",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "updatedAt", order: "desc" }] },
      meta: {
        populate: ["user", "class", "replies"]
      }
    },
  });

  const hasData = (discussionTable.refineCore.tableQuery.data?.data?.length || 0) > 0;
  const isLoading = discussionTable.refineCore.tableQuery.isLoading;

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Discussions</h1>
      <div className="intro-row">
        <p>Engage with students and teachers in class-wide discussion threads.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search discussions..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CreateButton />
        </div>
      </div>
      
      {!isLoading && !hasData ? (
        <div className="mt-8">
          <EmptyState
            icon={MessageSquare}
            title="No discussions found"
            description="Start a new conversation to engage with your class."
            action={{
              label: "Start Discussion",
              onClick: () => create("discussions"),
            }}
          />
        </div>
      ) : (
        <DataTable table={discussionTable} />
      )}
    </ListView>
  );
};

export default DiscussionsListPage;
