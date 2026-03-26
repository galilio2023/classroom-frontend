import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Building2,
  MoreHorizontal,
  Eye,
  UserMinus,
  UserPlus2,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { User, UserRole, UserStatus, VerificationStatus } from "@/types";

const roleVariants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "ai"
> = {
  [UserRole.ADMIN]: "default",
  [UserRole.TEACHER]: "ai",
  [UserRole.STUDENT]: "secondary",
  [UserRole.PARENT]: "outline",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  [UserStatus.ACTIVE]: "default",
  [UserStatus.SUSPENDED]: "destructive",
  [UserStatus.INACTIVE]: "secondary",
};

interface Props {
  user: User;
  index: number;
  isAdmin: boolean;
  identityId?: string;
  isAr: boolean;
  onShow: (id: string) => void;
  onStatusChange: (id: string, status: UserStatus) => void;
  onDelete: (id: string) => void;
  onReview: (user: User) => void;
}

export const UserCard = ({
  user,
  index,
  isAdmin,
  identityId,
  isAr,
  onShow,
  onStatusChange,
  onDelete,
  onReview,
}: Props) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      onClick={() => onShow(user.id)}
    >
      <div
        className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-e-full transition-all group-hover:h-20"
        style={{
          backgroundColor:
            user.role === UserRole.TEACHER
              ? "var(--ai-primary)"
              : "var(--primary)",
        }}
      />

      <div className="relative shrink-0 mb-4 md:mb-0">
        <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-background shadow-lg group-hover:scale-105 transition-transform duration-500">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {user.role === UserRole.TEACHER &&
          (user.verificationStatus === VerificationStatus.VERIFIED ? (
            <div className="absolute -top-3 -end-3 p-1.5 rounded-full bg-green-500 text-white shadow-lg border-4 border-background">
              <ShieldCheck className="h-4 w-4" />
            </div>
          ) : (
            <div className="absolute -top-3 -end-3 p-1.5 rounded-full bg-amber-500 text-white shadow-lg border-4 border-background animate-pulse">
              <ShieldAlert className="h-4 w-4" />
            </div>
          ))}
      </div>

      <div
        className={cn(
          "flex-1 min-w-0 w-full",
          isAr ? "md:me-8 md:text-end" : "md:ms-8 md:text-start",
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
            {user.name}
          </h3>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Badge
              variant={roleVariants[user.role] || "outline"}
              className="capitalize text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full"
            >
              {t(`roles.${user.role.toLowerCase()}` as any)}
            </Badge>
            <Badge
              variant={statusVariants[user.status]}
              className="capitalize text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full"
            >
              {t(`status.${user.status.toLowerCase()}` as any)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20">
            <div className="p-1.5 rounded-lg bg-primary/5">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[11px] font-black text-foreground truncate max-w-[150px]">
              {user.email}
            </span>
          </div>
          {user.department?.name && (
            <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20">
              <div className="p-1.5 rounded-lg bg-primary/5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-black text-foreground truncate max-w-[150px]">
                {user.department.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
        {user.role === UserRole.TEACHER &&
          (user.verificationStatus === VerificationStatus.PENDING ||
            user.verificationStatus === VerificationStatus.UNVERIFIED) && (
            <Button
              variant="outline"
              size="lg"
              className="w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onReview(user);
              }}
            >
              {t("buttons.reviewProof")}
            </Button>
          )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl bg-muted/30 hover:bg-muted/50"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-2 rounded-3xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
          >
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
              {t("users.governance.table.actions")}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onShow(user.id)}
              className="rounded-xl gap-3 py-3 cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Eye className="h-4 w-4" />
              </div>
              <span className="font-bold">{t("buttons.viewProfile")}</span>
            </DropdownMenuItem>
            {isAdmin && user.id !== identityId && (
              <>
                <DropdownMenuSeparator className="my-2 opacity-50" />
                {user.status === UserStatus.ACTIVE ? (
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusChange(user.id, UserStatus.SUSPENDED)
                    }
                    className="rounded-xl gap-3 py-3 cursor-pointer text-amber-600 focus:bg-amber-500/10"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                      <UserMinus className="h-4 w-4" />
                    </div>
                    <span className="font-bold">
                      {t("buttons.suspendUser")}
                    </span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(user.id, UserStatus.ACTIVE)}
                    className="rounded-xl gap-3 py-3 cursor-pointer text-green-600 focus:bg-green-500/10"
                  >
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                      <UserPlus2 className="h-4 w-4" />
                    </div>
                    <span className="font-bold">
                      {t("buttons.activateUser")}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(user.id)}
                  className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                >
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold">
                    {t("buttons.deleteAccount")}
                  </span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
