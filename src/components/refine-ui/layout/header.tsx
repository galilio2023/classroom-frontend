import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetIdentity, useLogout, useNavigation } from "@refinedev/core";
import { CircleUser, LogOut, User as UserIcon, LifeBuoy, BellRing } from "lucide-react";
import { toast } from "sonner";
import { User, UserRole } from "@/types";
import { ThemeToggle } from "../theme/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandMenu } from "@/components/command-menu";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { cn } from "@/lib/utils";
import { subscribeToPush } from "@/lib/push-notifications";

export function Header() {
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<User>();
  const { show, edit } = useNavigation();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Successfully logged out");
      },
    });
  };

  const handleEnablePush = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await subscribeToPush();
      toast.success("Push notifications enabled!");
    } else {
      toast.error("Notification permission denied");
    }
  };

  const isStudent = identity?.role === UserRole.STUDENT;

  // Generate a consistent background color based on the user's name
  const getBackgroundColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name = "") => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <header className="flex h-20 items-center gap-4 border-b border-border/40 bg-background/60 backdrop-blur-xl px-6 sticky top-0 z-50">
      <SidebarTrigger className="md:hidden" />

      <div className="w-full flex-1 flex items-center gap-6">
        <CommandMenu />
        
        {isStudent && (
          <div className="hidden lg:flex items-center gap-4 max-w-xs w-full">
            <XPProgressBar xp={identity?.xp || 0} className="w-full" />
          </div>
        )}
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
                <AvatarFallback className={cn("text-white font-bold", getBackgroundColor(identity?.name || ""))}>
                    {getInitials(identity?.name)}
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
            
            {isStudent && (
              <>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="px-2 py-2">
                  <XPProgressBar xp={identity?.xp || 0} />
                </div>
              </>
            )}

            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem 
                className="gap-2 cursor-pointer"
                onClick={() => identity?.id && show("users", identity.id)}
            >
              <UserIcon className="h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
                className="gap-2 cursor-pointer"
                onClick={() => identity?.id && edit("users", identity.id)}
            >
              <CircleUser className="h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
                className="gap-2 cursor-pointer"
                onClick={handleEnablePush}
            >
              <BellRing className="h-4 w-4" />
              <span>Enable Push Alerts</span>
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

Header.displayName = "Header";
