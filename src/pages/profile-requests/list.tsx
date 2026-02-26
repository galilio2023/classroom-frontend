import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import { ProfileChangeRequest } from "@/types";

const ProfileRequestsList = () => {
  const { mutate: approve } = useCustomMutation();
  const { mutate: reject } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleApprove = (id: number) => {
    approve({
        url: `/profile-requests/${id}/approve`,
        method: "post",
        values: {},
    }, {
        onSuccess: () => {
            toast.success("Changes approved and applied");
            invalidate({
                resource: "profile-requests",
                invalidates: ["list"],
            });
        }
    });
  };

  const handleReject = (id: number) => {
    reject({
        url: `/profile-requests/${id}/reject`,
        method: "post",
        values: { notes: "Changes rejected by administrator" },
    }, {
        onSuccess: () => {
            toast.success("Changes rejected");
            invalidate({
                resource: "profile-requests",
                invalidates: ["list"],
            });
        }
    });
  };

  const columns = useMemo<ColumnDef<ProfileChangeRequest>[]>(
    () => [
      {
        id: "user",
        header: "User",
        accessorKey: "user",
        cell: ({ getValue }) => {
          const user = getValue<ProfileChangeRequest["user"]>();
          if (!user) return null;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-[10px] text-muted-foreground">{user.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "changes",
        header: "Requested Changes",
        cell: ({ row }) => {
            const oldData = row.original.oldData || {};
            const newData = row.original.newData || {};
            const changedKeys = Object.keys(newData).filter(k => newData[k] !== oldData[k]);

            return (
                <div className="flex flex-col gap-1">
                    {changedKeys.map(key => (
                        <div key={key} className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="h-4 px-1 uppercase font-black">{key}</Badge>
                            <span className="text-muted-foreground line-through truncate max-w-[80px]">{String(oldData[key] || "empty")}</span>
                            <ArrowRight className="h-2 w-2" />
                            <span className="font-bold text-primary truncate max-w-[80px]">{String(newData[key])}</span>
                        </div>
                    ))}
                </div>
            );
        }
      },
      {
        accessorKey: "createdAt",
        header: "Requested On",
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleApprove(row.original.id)}
            >
                <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleReject(row.original.id)}
            >
                <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useTable({
    columns,
    refineCoreProps: {
        resource: "profile-requests",
    }
  });

  return (
    <ListView>
      <ListViewHeader 
        title="Profile Change Requests" 
      />
      <DataTable table={table} />
    </ListView>
  );
};

export default ProfileRequestsList;
