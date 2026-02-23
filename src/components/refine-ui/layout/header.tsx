"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { CircleUser } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";
import { ThemeToggle } from "../theme/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notification-bell";

export function Header() {
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<User>();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Successfully logged out");
      },
    });
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-muted/5 px-4 py-2 lg:h-16 lg:px-6">
      {/* The mobile sidebar trigger is now part of the header */}
      <SidebarTrigger className="md:hidden" />

      <div className="w-full flex-1">
        {/* Optional: Add a search bar or other header content here */}
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {identity?.name || "My Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
