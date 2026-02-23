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
import { CircleUser, LogOut, Settings, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";
import { ThemeToggle } from "../theme/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <header className="flex h-20 items-center gap-4 border-b border-border/40 bg-background/60 backdrop-blur-xl px-6 sticky top-0 z-50">
      <SidebarTrigger className="md:hidden" />

      <div className="w-full flex-1">
        {/* Optional: Add a search bar or other header content here */}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/50">
            <NotificationBell />
            <ThemeToggle />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-primary/10 transition-colors">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src={identity?.image || ""} alt={identity?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {identity?.name?.[0] || <CircleUser className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 sidebar-glass border-border/50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{identity?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {identity?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <LifeBuoy className="h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
