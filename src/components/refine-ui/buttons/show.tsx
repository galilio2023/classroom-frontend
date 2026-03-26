"use client";

import { Button } from "@/components/ui/button";
import { type BaseKey, useShowButton } from "@refinedev/core";
import { Eye } from "lucide-react";
import React from "react";

type ShowButtonProps = {
  resource?: string;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
  hideText?: boolean; // Add this prop
} & React.ComponentProps<typeof Button>;

export const ShowButton = React.forwardRef<React.ComponentRef<typeof Button>, ShowButtonProps>(
  ({ resource, recordItemId, accessControl, meta, hideText, children, onClick, ...rest }, ref) => {
    const { hidden, disabled, LinkComponent, to, label } = useShowButton({
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
              <Eye className="h-4 w-4" />
              {!hideText && <span>{label}</span>}
            </div>
          )}
        </LinkComponent>
      </Button>
    );
  }
);

ShowButton.displayName = "ShowButton";
