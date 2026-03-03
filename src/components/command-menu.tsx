import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetIdentity,
  useNavigation,
  useLogout,
  useList,
} from "@refinedev/core";
import {
  Calculator,
  Calendar,
  User as UserIcon,
  BookOpen,
  Sparkles,
  Home,
  LogOut,
  Moon,
  Sun,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { User, Class, Assignment } from "@/types";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<User>();
  const { show } = useNavigation();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();

  const isStaff = identity?.role === "teacher" || identity?.role === "admin";

  // Fetch dynamic data for search using useList (Rule 3 compliance)
  // useList returns { query, result }, we use result for direct access to data
  const { result: classesResult } = useList<Class>({
    resource: "classes",
    queryOptions: { enabled: open },
    pagination: { pageSize: 5 },
  });

  const { result: assignmentsResult } = useList<Assignment>({
    resource: "assignments",
    queryOptions: { enabled: open },
    pagination: { pageSize: 5 },
  });

  const classes = classesResult?.data || [];
  const assignments = assignmentsResult?.data || [];

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-md bg-muted/50 hover:bg-muted transition-colors w-full max-w-50"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-auto">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>

            {/* AI Assistant Access Control (GEMINI.md compliance) */}
            {isStaff && (
              <CommandItem
                onSelect={() => runCommand(() => navigate("/ai-assistant"))}
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <span>AI Assistant</span>
              </CommandItem>
            )}

            <CommandItem
              onSelect={() => runCommand(() => navigate("/calendar"))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
          </CommandGroup>

          {classes.length > 0 && (
            <CommandGroup heading="Classes">
              {classes.map((c: Class) => (
                <CommandItem
                  key={c.id}
                  onSelect={() =>
                    runCommand(() => show("classes", c.id.toString()))
                  }
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{c.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {assignments.length > 0 && (
            <CommandGroup heading="Assignments">
              {assignments.map((a: Assignment) => (
                <CommandItem
                  key={a.id}
                  onSelect={() =>
                    runCommand(() => show("assignments", a.id.toString()))
                  }
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  <span>{a.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() =>
                runCommand(() => identity?.id && show("users", identity.id))
              }
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Toggle Theme</span>
              <CommandShortcut>⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => logout())}>
              <LogOut className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-destructive">Logout</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
