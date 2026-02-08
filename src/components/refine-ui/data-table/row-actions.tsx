import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCan } from "@refinedev/core";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

interface DataTableRowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onShow?: () => void; // Add a specific prop for the show action
  resource?: string;
  recordId?: number | string;
  editLabel?: string;
  deleteLabel?: string;
}

export function DataTableRowActions({
  onEdit,
  onDelete,
  onShow,
  resource,
  recordId,
  editLabel,
  deleteLabel,
}: DataTableRowActionsProps) {
  // Call all necessary hooks at the top level
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

  const { data: showCan } = useCan({
    resource: resource,
    action: "show",
    params: { id: recordId },
    queryOptions: { enabled: !!(resource && recordId && onShow) },
  });

  // Determine if there are any visible actions before rendering the menu
  const hasVisibleActions = editCan?.can || deleteCan?.can || showCan?.can;

  if (!hasVisibleActions) {
    return null; // If no actions are permitted, render nothing.
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
          {showCan?.can && onShow && (
            <DropdownMenuItem
              onClick={onShow}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>View Students</span>
            </DropdownMenuItem>
          )}

          {editCan?.can && onEdit && (
            <DropdownMenuItem
              onClick={onEdit}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              <span>{editLabel || "Edit"}</span>
            </DropdownMenuItem>
          )}

          {(showCan?.can || editCan?.can) && deleteCan?.can && (
            <DropdownMenuSeparator />
          )}

          {deleteCan?.can && onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleteLabel || "Delete"}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
