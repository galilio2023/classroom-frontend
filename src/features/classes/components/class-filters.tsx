import { Search, Building2, Filter } from "lucide-react";
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
import { Department, Subject } from "@/types";

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedDepartment: string | number;
  setSelectedDepartment: (v: string) => void;
  selectedSubject: string;
  setSelectedSubject: (v: string) => void;
  departments: Department[];
  subjects: Subject[];
}

export const ClassFilters = ({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  selectedSubject,
  setSelectedSubject,
  departments,
  subjects,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.5rem] md:rounded-4xl backdrop-blur-xl sticky top-20 z-30 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors start-4 md:start-6" />
          <Input
            type="text"
            placeholder={t("classes.list.searchPlaceholder")}
            className="h-14 md:h-16 rounded-[1.25rem] md:rounded-3xl border-none bg-background/50 shadow-inner font-bold text-base md:text-lg ps-12 md:ps-14 pe-4 md:pe-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-background/50 px-4 md:px-6 py-2 rounded-[1.25rem] md:rounded-3xl border border-border/40 shrink-0 shadow-inner">
          <Building2 className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/60" />
          <Select value={selectedDepartment.toString()} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px] md:w-[220px] border-none h-12 focus:ring-0 shadow-none font-black text-xs uppercase tracking-widest bg-transparent">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
              <SelectItem value="all" className="font-bold py-3">
                All Departments
              </SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()} className="font-bold py-3">
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 bg-background/50 px-4 md:px-6 py-2 rounded-[1.25rem] md:rounded-3xl border border-border/40 shrink-0 shadow-inner">
          <Filter className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/60" />
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px] md:w-[220px] border-none h-12 focus:ring-0 shadow-none font-black text-xs uppercase tracking-widest bg-transparent">
              <SelectValue placeholder={t("classes.list.allSubjects")} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
              <SelectItem value="all" className="font-bold py-3">
                {t("classes.list.allSubjects")}
              </SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.name} className="font-bold py-3">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
