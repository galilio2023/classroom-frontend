import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import {
  UserPlus,
  // //   Loader2,
  // //   Users as UsersIcon,
  MessageSquare,
  Eye,
  Layers,
  Bookmark,
} from "lucide-react";
import { useMemo } from "react";
import { useList, useGetIdentity, useNavigation } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Subscription {
  id: number;
  student: User;
  classId: number;
  createdAt: string;
}

const TeacherSubscriptionsList = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("teacherSubscriptions.title"));
  const { data: identity } = useGetIdentity<User>();
  const { show } = useNavigation();
  const isAr = i18n.language === "ar";
  const isStudent = identity?.role === UserRole.STUDENT;

  // Resource name depends on the context it's used in (based on route/config)
  const resource = isStudent ? "my-classes" : "teacher-subscriptions";

  const { query } = useList<any>({
    resource: resource,
    filters: isStudent
      ? [
          {
            field: "studentId",
            operator: "eq",
            value: identity?.id,
          },
        ]
      : [],
    queryOptions: {
      enabled: !!identity?.id,
    },
    meta: {
      populate: isStudent ? ["class", "class.teachers", "class.teachers.teacher"] : ["student"],
    },
  });

  const isLoading = query.isLoading;

  // For Teachers: list of students enrolled in their classes
  // For Students: list of teachers of classes they are enrolled in
  const items = useMemo(() => {
    const rawData = query.data?.data || [];

    if (isStudent) {
      const teacherMap = new Map<string, User>();
      rawData.forEach((enrollment: any) => {
        enrollment.class?.teachers?.forEach((ct: any) => {
          if (ct.teacher) {
            teacherMap.set(ct.teacher.id, ct.teacher);
          }
        });
      });
      return Array.from(teacherMap.values());
    } else {
      const studentMap = new Map<string, User>();
      rawData.forEach((enrollment: any) => {
        if (enrollment.student) {
          studentMap.set(enrollment.student.id, enrollment.student);
        }
      });
      return Array.from(studentMap.values());
    }
  }, [query.data, isStudent]);

  const hasData = items.length > 0;

  return (
    <ListView>
      <div className="space-y-8 md:space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-4 flex-1">
            <Breadcrumb />
            <div className="space-y-1">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  {isStudent ? (
                    <Bookmark className="h-6 w-6 md:h-8 md:w-8" />
                  ) : (
                    <UserPlus className="h-6 w-6 md:h-8 md:w-8" />
                  )}
                </div>
                {isStudent
                  ? t("resources.followed-teachers.label")
                  : t("teacherSubscriptions.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {isStudent ? t("myTeachers.description") : t("teacherSubscriptions.description")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* List Section */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_: any, i: any) => (
                <Card
                  key={i}
                  className="p-6 flex items-center gap-6 border-border/20 bg-background/50"
                >
                  <Skeleton className="h-20 w-20 rounded-3xl shrink-0" />
                  <div className="flex-1 space-y-4 w-full">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
              <EmptyState
                icon={Layers}
                title={
                  isStudent ? t("myTeachers.empty.title") : t("teacherSubscriptions.empty.title")
                }
                description={
                  isStudent
                    ? t("myTeachers.empty.description")
                    : t("teacherSubscriptions.empty.description")
                }
                className="border-none bg-transparent min-h-0"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {items.map((person: User, index: number) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative flex flex-col p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16 rounded-2xl border-4 border-background shadow-lg group-hover:scale-105 transition-transform duration-500">
                      <AvatarImage src={person.image ?? undefined} alt={person.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                        {person.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                        {person.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{person.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/40 w-full mt-auto">
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] transition-all border-primary/20 hover:bg-primary/5 text-primary"
                    >
                      <a href={`mailto:${person.email}`}>
                        <MessageSquare className="h-4 w-4 me-2" />
                        {t("buttons.sendMessage")}
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                    >
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          show("users", person.id);
                        }}
                      >
                        {t("buttons.viewProfile")}
                        <Eye className={cn("h-4 w-4 ms-2", isAr && "me-2 ms-0")} />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ListView>
  );
};

export default TeacherSubscriptionsList;
