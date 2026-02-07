import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCan } from "@refinedev/core";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface CustomAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  action: "show" | "list" | "create" | "edit" | "delete"; // Add action type
}

interface DataTableRowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  customActions?: CustomAction[];
  resource?: string;
  recordId?: number | string;
}

export function DataTableRowActions({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  customActions,
  resource,
  recordId,
}: DataTableRowActionsProps) {
  const { data: editCan } = useCan({
    resource: resource,
    action: "edit",
    params: { id: recordId },
    queryOptions: { enabled: !!(resource && recordId && onEdit) },
  });

  const { data: deleteCan } = useCan({
    resource: resource,
    action: "delete",
    params: { id: recordId },
    queryOptions: { enabled: !!(resource && recordId && onDelete) },
  });

  // We need to check permissions for custom actions as well
  const visibleCustomActions = customActions?.filter(action => {
    const { data: can } = useCan({
      resource: resource,
      action: action.action,
      params: { id: recordId },
      queryOptions: { enabled: !!(resource && recordId) },
    });
    return can?.can;
  }) ?? [];

  const hasActions = (onEdit && editCan?.can) || (onDelete && deleteCan?.can) || visibleCustomActions.length > 0;

  if (!hasActions) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && editCan?.can && (
            <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2 cursor-pointer">
              <Pencil className="h-4 w-4" />
              <span>{editLabel}</span>
            </DropdownMenuItem>
          )}

          {visibleCustomActions.map((action, index) => (
            <DropdownMenuItem key={index} onClick={action.onClick} className="flex items-center gap-2 cursor-pointer">
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}

          {(onEdit && editCan?.can || visibleCustomActions.length > 0) && onDelete && deleteCan?.can && <DropdownMenuSeparator />}
          
          {onDelete && deleteCan?.can && (
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleteLabel}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
