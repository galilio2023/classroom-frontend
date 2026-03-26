"use client";

import { Button } from "@/components/ui/button";
import { useCan, type BaseKey } from "@refinedev/core";
import { Loader2, Trash } from "lucide-react";
import React from "react";

// This is the final, correct DeleteButton component, using the user's suggested fix.

// Extract the props type directly from the Button component
type DeleteButtonProps = React.ComponentProps<typeof Button> & {
  resource?: string;
  recordItemId?: BaseKey;
  hideText?: boolean;
  loading?: boolean;
};

export const DeleteButton = React.forwardRef<
  HTMLButtonElement,
  DeleteButtonProps
>(({ resource, recordItemId, hideText, loading, children, ...rest }, ref) => {
  const { data: can } = useCan({
    resource: resource,
    action: "delete",
    params: { id: recordItemId },
  });

  if (can?.can === false) {
    return null;
  }

  return (
    <Button variant="destructive" ref={ref} disabled={loading} {...rest}>
      {loading ? (
        <Loader2 className="me-2 h-4 w-4 animate-spin" />
      ) : (
        (children ?? (
          <div className="flex items-center gap-2 font-semibold">
            <Trash className="h-4 w-4" />
            {!hideText && <span>Delete</span>}
          </div>
        ))
      )}
    </Button>
  );
});

DeleteButton.displayName = "DeleteButton";
