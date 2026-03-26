import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  TrendingUp,
  LayoutGrid,
  Award,
  UserCircle,
  MoreHorizontal,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import {
  flexRender,
  ColumnDef,
  HeaderGroup,
  Header,
  Row,
  Cell,
} from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useNavigation, HttpError } from "@refinedev/core";
import { User as UserType, Enrollment } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";

const ProgressListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const { show } = useNavigation();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "user.name",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    return f;
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: t("progressPage.table.student"),
        accessorKey: "user",
        cell: ({ getValue }) => {
          const user = getValue<UserType>();
          if (!user) return null;
          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-primary/5 text-primary font-black">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-black text-foreground leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Student
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "class.name",
        header: t("progressPage.table.class"),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/5">
              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-bold truncate max-w-37.5">
              {getValue<string>()}
            </span>
          </div>
        ),
      },
      {
        id: "completion",
        header: t("progressPage.table.completion"),
        cell: () => {
          const completion = Math.floor(Math.random() * 100);
          return (
            <div className="flex flex-col gap-2 min-w-30">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                <span className="text-muted-foreground/60">
                  {t("progressPage.table.completion")}
                </span>
                <span className="text-primary">{completion}%</span>
              </div>
              <ProgressBar
                value={completion}
                className="h-1.5 rounded-full bg-primary/10"
              />
            </div>
          );
        },
      },
      {
        id: "grade",
        header: t("progressPage.table.grade"),
        cell: () => {
          const grade = 65 + Math.floor(Math.random() * 30);
          const isAtRisk = grade < 70;
          return (
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "h-7 px-3 rounded-xl font-black text-[10px] tracking-widest uppercase border-none shadow-sm",
                  isAtRisk
                    ? "bg-destructive/10 text-destructive"
                    : "bg-emerald-500/10 text-emerald-600",
                )}
              >
                {grade}%
              </Badge>
              {!isAtRisk && grade >= 90 && (
                <Award className="h-4 w-4 text-gold-primary animate-pulse" />
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-muted/30 hover:bg-muted/50"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
              >
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-3">
                  Student Progress
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    (row.original?.student as any)?.id &&
                    navigate(`/portfolio/${(row.original.student as any).id}`)
                  }
                  className="rounded-xl gap-3 py-3 cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <UserCircle className="h-4 w-4" />
                  </div>
                  <span className="font-bold">{t("buttons.portfolio")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    (row.original?.student as any)?.id &&
                    show("users", (row.original.student as any).id)
                  }
                  className="rounded-xl gap-3 py-3 cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="font-bold">{t("buttons.viewProfile")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate, show, t],
  );

  const {
    refineCore: { tableQuery: query },
    reactTable,
  } = useTable<Enrollment, HttpError>({
    refineCoreProps: {
      resource: "enrollments",
      pagination: { pageSize: 50, mode: "server" },
      filters: { permanent: filters },
      meta: {
        populate: ["user", "class"],
      },
    },
    columns,
  });

  const progressData = query.data?.data || [];
  const isLoading = query.isPending;
  const hasData = progressData.length > 0;

  return (
    <ListView>
      <div className="space-y-8 md:space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-4 flex-1 text-start">
            <Breadcrumb />
            <div className="space-y-1">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("progressPage.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("progressPage.description")}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-8 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold uppercase tracking-widest text-[10px] shadow-sm gap-2"
            >
              <Award className="h-4 w-4" />
              {t("buttons.topPerformers")}
            </Button>
          </div>
        </motion.div>

        {/* Search & Filter Card - Sticky */}
        <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 group">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors",
                  "start-4",
                )}
              />
              <Input
                type="text"
                placeholder={t("progressPage.searchPlaceholder")}
                className={cn(
                  "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium",
                  "ps-11 pe-4",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Progress List Area */}
        <div className="relative min-h-100">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i: number) => (
                <Card
                  key={i}
                  className="p-6 flex items-center gap-6 border-border/20 bg-background/50"
                >
                  <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-62.5 max-w-full" />
                    <Skeleton className="h-4 w-45 max-w-full" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </Card>
              ))}
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
              <EmptyState
                icon={Layers}
                title="No Progress Found"
                description="Try adjusting your filters or search terms."
                className="border-none bg-transparent min-h-0"
              />
            </div>
          ) : (
            <div className="rounded-3xl md:rounded-[2.5rem] border border-border/40 overflow-hidden bg-card/50 backdrop-blur-3xl shadow-2xl shadow-black/5">
              <Table>
                <TableHeader>
                  {reactTable
                    .getHeaderGroups()
                    .map((headerGroup: HeaderGroup<Enrollment>) => (
                      <TableRow
                        key={headerGroup.id}
                        className="hover:bg-transparent border-border/40"
                      >
                        {headerGroup.headers.map(
                          (header: Header<Enrollment, unknown>) => (
                            <TableHead
                              key={header.id}
                              className="h-14 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          ),
                        )}
                      </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {reactTable
                      .getRowModel()
                      .rows.map((row: Row<Enrollment>, index: number) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group transition-all hover:bg-primary/2 border-border/40 cursor-pointer"
                          onClick={() => {
                            if ((row.original?.student as any)?.id) {
                              navigate(
                                `/portfolio/${(row.original.student as any).id}`,
                              );
                            }
                          }}
                        >
                          {row
                            .getVisibleCells()
                            .map((cell: Cell<Enrollment, unknown>) => (
                              <TableCell key={cell.id} className="px-6 py-4">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            ))}
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </ListView>
  );
};

export default ProgressListPage;
