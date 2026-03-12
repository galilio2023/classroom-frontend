import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, TrendingUp, LayoutGrid, Award, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { User as UserType, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProgressListPage = () => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<UserType>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const { show } = useNavigation();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "user.name", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const progressTable = useTable<any>({
    columns: useMemo<ColumnDef<any>[]>(
      () => [
        {
          id: "student",
          header: () => <p className="column-title">{t("progressPage.table.student")}</p>,
          accessorKey: "user",
          cell: ({ getValue }) => {
            const user = getValue<UserType>();
            if (!user) return null;
            return (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{user.name}</span>
              </div>
            );
          }
        },
        {
          accessorKey: "class.name",
          header: () => <p className="column-title">{t("progressPage.table.class")}</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{getValue<string>()}</span>
            </div>
          )
        },
        {
          id: "completion",
          header: () => <p className="column-title">{t("progressPage.table.completion")}</p>,
          cell: () => {
            const completion = Math.floor(Math.random() * 100);
            return (
              <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">{completion}%</span>
                </div>
                <ProgressBar value={completion} className="h-1.5" />
              </div>
            );
          }
        },
        {
          id: "grade",
          header: () => <p className="column-title">{t("progressPage.table.grade")}</p>,
          cell: () => {
            const grade = 65 + Math.floor(Math.random() * 30);
            const isAtRisk = grade < 70;
            return (
              <Badge 
                variant={isAtRisk ? "destructive" : "outline"} 
                className={!isAtRisk ? "text-green-600 border-green-200 bg-green-50" : ""}
              >
                {grade}%
              </Badge>
            );
          }
        },
        {
          id: "actions",
          size: 150,
          header: () => <p className="column-title text-right pr-4">{t("progressPage.table.actions")}</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1.5"
                onClick={(e) => {
                    e.stopPropagation();
                    if (row.original?.user?.id) {
                        navigate(`/portfolio/${row.original.user.id}`);
                    }
                }}
              >
                <UserCircle className="h-3.5 w-3.5" />
                {t("buttons.portfolio")}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1.5"
                onClick={(e) => {
                    e.stopPropagation();
                    if (row.original?.user?.id) {
                        show("users", row.original.user.id);
                    }
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {t("buttons.viewProfile")}
              </Button>
            </div>
          ),
        },
      ],
      [show, navigate, t],
    ),
    refineCoreProps: {
      resource: "enrollments", 
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      meta: {
        populate: ["user", "class"]
      }
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">{t("progressPage.title")}</h1>
      <div className="intro-row">
        <p>{t("progressPage.description")}</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder={t("progressPage.searchPlaceholder")}
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Award className="h-4 w-4" />
            {t("buttons.topPerformers")}
          </Button>
        </div>
      </div>
      <DataTable 
        table={progressTable} 
        onRowClick={(record) => {
            if (record?.user?.id) {
                navigate(`/portfolio/${record.user.id}`);
            }
        }}
      />
    </ListView>
  );
};

export default ProgressListPage;
