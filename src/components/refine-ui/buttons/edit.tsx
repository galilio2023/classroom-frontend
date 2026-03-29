"use client";

import { Button } from "@/components/ui/button";
import { type BaseKey, useEditButton } from "@refinedev/core";
import { Pencil } from "lucide-react";
import React from "react";

type EditButtonProps = {
  resource?: string;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
  hideText?: boolean; // Add this prop
} & React.ComponentProps<typeof Button>;

export const EditButton = React.forwardRef<React.ComponentRef<typeof Button>, EditButtonProps>(
  ({ resource, recordItemId, accessControl, meta, hideText, children, onClick, ...rest }, ref) => {
    const { hidden, disabled, LinkComponent, to, label } = useEditButton({
      resource,
      id: recordItemId,
      accessControl,
      meta,
    });

    const isDisabled = disabled || rest.disabled;
    const isHidden = hidden || rest.hidden;

    if (isHidden) return null;

    return (
      <Button {...rest} ref={ref} disabled={isDisabled} asChild>
        <LinkComponent
          to={to}
          replace={false}
          onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
            if (isDisabled) {
              e.preventDefault();
              return;
            }
            if (onClick) {
              e.preventDefault();
              onClick(e);
            }
          }}
        >
          {children ?? (
            <div className="flex items-center gap-2 font-semibold">
              <Pencil className="h-4 w-4" />
              {!hideText && <span>{label}</span>}
            </div>
          )}
        </LinkComponent>
      </Button>
    );
  }
);

EditButton.displayName = "EditButton";
