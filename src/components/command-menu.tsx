import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  useNavigation,
  useLogout,
  useCustom,
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
  History,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Loader2,
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
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { useDebounce } from "react-use";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/hooks/use-user-role";

const RECENT_SEARCHES_KEY = "classroom_recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface SearchResult {
  id: number | string;
  type: "class" | "subject" | "assignment" | "resource";
  title: string;
  description?: string | null;
  link: string;
  metadata?: any;
}

export function CommandMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  const navigate = useNavigate();
  const { identity, isStaff, isStudent } = useUserRole();
  const { show, create, list } = useNavigation();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();

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

  // --- UNIFIED GLOBAL SEARCH ---
  const { result: searchResult, query: searchQuery } = useCustom<SearchResult[]>({
    url: "/search",
    method: "get",
    config: {
        query: { q: debouncedSearch }
    },
    queryOptions: { 
        enabled: open && debouncedSearch.length >= 2,
        // Keep previous data while fetching new results for smoother UX
        placeholderData: (previousData) => previousData,
    },
  });

  const results = searchResult?.data || [];
  const isSearching = searchQuery.isFetching;

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

  const getIcon = (type: string) => {
    switch (type) {
        case "class": return <BookOpen className="mr-2 h-4 w-4 text-blue-500 rtl:mr-0 rtl:ml-2" />;
        case "assignment": return <Calculator className="mr-2 h-4 w-4 text-orange-500 rtl:mr-0 rtl:ml-2" />;
        case "resource": return <FileText className="mr-2 h-4 w-4 text-emerald-500 rtl:mr-0 rtl:ml-2" />;
        case "subject": return <GraduationCap className="mr-2 h-4 w-4 text-purple-500 rtl:mr-0 rtl:ml-2" />;
        default: return <Search className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-md bg-muted/50 hover:bg-muted transition-colors w-full max-w-50"
      >
        <Search className="h-4 w-4" />
        <span>{t("common.search")}</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-auto ltr:flex rtl:hidden">
          <span className="text-xs">⌘</span>K
        </kbd>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 mr-auto rtl:flex ltr:hidden">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
            <CommandInput 
                placeholder={t("common.typeToSearch")} 
                value={search}
                onValueChange={setSearch}
            />
            {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
        <CommandList>
          <CommandEmpty>
            {isSearching ? t("common.searching") : t("common.noResults")}
          </CommandEmpty>
          
          {!search && recentSearches.length > 0 && (
            <CommandGroup heading={t("common.recentSearches")}>
              {recentSearches.map((term) => (
                <CommandItem
                  key={term}
                  onSelect={() => setSearch(term)}
                >
                  <History className="mr-2 h-4 w-4 text-muted-foreground rtl:mr-0 rtl:ml-2" />
                  <span>{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading={t("common.quickActions")}>
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <Home className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
              <span>{t("resources.dashboard.label")}</span>
            </CommandItem>

            {isStaff && (
              <>
                <CommandItem onSelect={() => runCommand(() => create("classes"))}>
                  <PlusCircle className="mr-2 h-4 w-4 text-primary rtl:mr-0 rtl:ml-2" />
                  <span>{t("buttons.createClass")}</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => list("submissions"))}>
                  <ClipboardCheck className="mr-2 h-4 w-4 text-primary rtl:mr-0 rtl:ml-2" />
                  <span>{t("resources.submissions.label")}</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => navigate("/ai-assistant"))}>
                  <Sparkles className="mr-2 h-4 w-4 text-primary rtl:mr-0 rtl:ml-2" />
                  <span>{t("resources.ai-assistant.label")}</span>
                </CommandItem>
              </>
            )}

            {isStudent && (
              <CommandItem onSelect={() => runCommand(() => list("classes"))}>
                <GraduationCap className="mr-2 h-4 w-4 text-primary rtl:mr-0 rtl:ml-2" />
                <span>{t("buttons.joinClass")}</span>
              </CommandItem>
            )}

            <CommandItem onSelect={() => runCommand(() => navigate("/calendar"))}>
              <Calendar className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
              <span>{t("resources.calendar.label")}</span>
            </CommandItem>
          </CommandGroup>

          {results.length > 0 && (
            <CommandGroup heading={t("common.searchResults")}>
              {results.map((res) => (
                <CommandItem
                  key={`${res.type}-${res.id}`}
                  onSelect={() => runCommand(() => navigate(res.link), res.title)}
                >
                  {getIcon(res.type)}
                  <div className="flex flex-col">
                    <span>{res.title}</span>
                    {res.description && (
                        <span className="text-[10px] text-muted-foreground line-clamp-1">{res.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading={t("common.settings")}>
            <CommandItem
              onSelect={() =>
                runCommand(() => identity?.id && show("users", identity.id))
              }
            >
              <UserIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
              <span>{t("resources.portfolio.label")}</span>
              <CommandShortcut className="ltr:block rtl:hidden">⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
              ) : (
                <Moon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
              )}
              <span>{t("common.toggleTheme")}</span>
              <CommandShortcut className="ltr:block rtl:hidden">⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => logout())}>
              <LogOut className="mr-2 h-4 w-4 text-destructive rtl:mr-0 rtl:ml-2" />
              <span className="text-destructive">{t("buttons.signOut")}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
