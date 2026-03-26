import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { UserRole, UserStatus } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedRole: string;
  setSelectedRole: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  verificationFilter: string;
  setVerificationFilter: (v: string) => void;
  isAr: boolean;
}

export const UserFilters = ({
  searchQuery,
  setSearchQuery,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  verificationFilter,
  setVerificationFilter,
  isAr,
}: Props) => {
  const { t } = useTranslation();

  return (
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
            placeholder={t("users.governance.filters.searchPlaceholder")}
            className={cn(
              "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium",
              "ps-11 pe-4",
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-background/50 px-3 py-1 rounded-2xl border border-border/40">
          <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Select
            value={verificationFilter}
            onValueChange={setVerificationFilter}
          >
            <SelectTrigger className="w-[160px] border-none h-10 focus:ring-0 shadow-none font-bold text-[10px] uppercase tracking-wider bg-transparent">
              <SelectValue
                placeholder={t("users.governance.filters.verification")}
              />
            </SelectTrigger>
            <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
              <SelectItem value="all" className="font-bold">
                {t("users.governance.filters.allVerification")}
              </SelectItem>
              <SelectItem value="pending" className="font-bold">
                {t("users.governance.filters.pendingTeachers")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[130px] h-12 rounded-2xl font-bold text-[10px] uppercase tracking-wider bg-background/50 border border-border/40 shadow-sm">
            <SelectValue placeholder={t("users.governance.filters.role")} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
            <SelectItem value="all" className="font-bold">
              {t("users.governance.filters.allRoles")}
            </SelectItem>
            <SelectItem value={UserRole.ADMIN} className="font-bold">
              {t("roles.admin")}
            </SelectItem>
            <SelectItem value={UserRole.TEACHER} className="font-bold">
              {t("roles.teacher")}
            </SelectItem>
            <SelectItem value={UserRole.STUDENT} className="font-bold">
              {t("roles.student")}
            </SelectItem>
            <SelectItem value={UserRole.PARENT} className="font-bold">
              {t("roles.parent")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[130px] h-12 rounded-2xl font-bold text-[10px] uppercase tracking-wider bg-background/50 border border-border/40 shadow-sm">
            <SelectValue placeholder={t("users.governance.filters.status")} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
            <SelectItem value="all" className="font-bold">
              {t("users.governance.filters.allStatus")}
            </SelectItem>
            <SelectItem value={UserStatus.ACTIVE} className="font-bold">
              {t("status.active")}
            </SelectItem>
            <SelectItem value={UserStatus.SUSPENDED} className="font-bold">
              {t("status.suspended")}
            </SelectItem>
            <SelectItem value={UserStatus.INACTIVE} className="font-bold">
              {t("status.inactive")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
