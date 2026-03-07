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
  PlusCircle,
  Users,
  FileText,
  History,
  GraduationCap,
  ClipboardCheck,
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
import { User, Class, Assignment, Resource, UserRole } from "@/types";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { useDebounce } from "react-use";

const RECENT_SEARCHES_KEY = "classroom_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<User>();
  const { show, create, list } = useNavigation();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();

  const isTeacher = identity?.role === UserRole.TEACHER;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isStudent = identity?.role === UserRole.STUDENT;
  const isStaff = isTeacher || isAdmin;

  useDebounce(
    () => {
      setDebouncedSearch(search);
    },
    300,
    [search]
  );

  // Load recent searches
  React.useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [
      term,
      ...recentSearches.filter((s) => s !== term),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Fetch dynamic data for search
  const { data: classesData } = useList<Class>({
    resource: "classes",
    filters: debouncedSearch ? [{ field: "name", operator: "contains", value: debouncedSearch }] : [],
    queryOptions: { enabled: open && !!debouncedSearch },
    pagination: { pageSize: 5 },
  });

  const { data: assignmentsData } = useList<Assignment>({
    resource: "assignments",
    filters: debouncedSearch ? [{ field: "title", operator: "contains", value: debouncedSearch }] : [],
    queryOptions: { enabled: open && !!debouncedSearch },
    pagination: { pageSize: 5 },
  });

  const { data: studentsData } = useList<User>({
    resource: "users",
    filters: [
      ...(debouncedSearch ? [{ field: "name", operator: "contains", value: debouncedSearch }] : []),
      { field: "role", operator: "eq", value: "student" }
    ],
    queryOptions: { enabled: open && !!debouncedSearch },
    pagination: { pageSize: 5 },
  });

  const { data: resourcesData } = useList<Resource>({
    resource: "resources",
    filters: debouncedSearch ? [{ field: "title", operator: "contains", value: debouncedSearch }] : [],
    queryOptions: { enabled: open && !!debouncedSearch },
    pagination: { pageSize: 5 },
  });

  const classes = classesData?.data || [];
  const assignments = assignmentsData?.data || [];
  const students = studentsData?.data || [];
  const resources = resourcesData?.data || [];

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

  const runCommand = React.useCallback((command: () => void, term?: string) => {
    setOpen(false);
    if (term) saveRecentSearch(term);
    command();
  }, [recentSearches]);

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
        <CommandInput 
          placeholder="Type a command or search..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {!search && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((term) => (
                <CommandItem
                  key={term}
                  onSelect={() => setSearch(term)}
                >
                  <History className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>

            {isStaff && (
              <>
                <CommandItem onSelect={() => runCommand(() => create("classes"))}>
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                  <span>Create Class</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => list("submissions"))}>
                  <ClipboardCheck className="mr-2 h-4 w-4 text-primary" />
                  <span>Grade Submissions</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => navigate("/ai-assistant"))}>
                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  <span>AI Assistant</span>
                </CommandItem>
              </>
            )}

            {isStudent && (
              <CommandItem onSelect={() => runCommand(() => list("classes"))}>
                <GraduationCap className="mr-2 h-4 w-4 text-primary" />
                <span>Join Class</span>
              </CommandItem>
            )}

            <CommandItem onSelect={() => runCommand(() => navigate("/calendar"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
          </CommandGroup>

          {classes.length > 0 && (
            <CommandGroup heading="Classes">
              {classes.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => runCommand(() => show("classes", c.id.toString()), c.name)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{c.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {students.length > 0 && (
            <CommandGroup heading="Students">
              {students.map((s) => (
                <CommandItem
                  key={s.id}
                  onSelect={() => runCommand(() => show("users", s.id), s.name)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{s.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {assignments.length > 0 && (
            <CommandGroup heading="Assignments">
              {assignments.map((a) => (
                <CommandItem
                  key={a.id}
                  onSelect={() => runCommand(() => show("assignments", a.id.toString()), a.title)}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  <span>{a.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {resources.length > 0 && (
            <CommandGroup heading="Resources">
              {resources.map((r) => (
                <CommandItem
                  key={r.id}
                  onSelect={() => runCommand(() => navigate(`/classes/${r.classId}/lessons/${r.id}`), r.title)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{r.title}</span>
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
