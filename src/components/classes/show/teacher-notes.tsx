import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TeacherNotesProps {
  teacherNotes: string;
  handleNoteChange: (val: string) => void;
  isLoadingNotes: boolean;
}

export const TeacherNotes = ({
  teacherNotes,
  handleNoteChange,
  isLoadingNotes,
}: TeacherNotesProps) => {
  const { t } = useTranslation();

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden">
      <CardHeader className="p-10 pb-4 bg-yellow-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-yellow-500/10 text-yellow-600">
            <StickyNote className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-start">
            <CardTitle className="text-xl font-black tracking-tight">
              {t("classes.show.details.teacherNotes")}
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-yellow-600/60">
              {t("classes.show.details.teacherNotesDesc")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="relative">
          {isLoadingNotes && (
            <div className="absolute top-4 right-4">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-600/40" />
            </div>
          )}
          <Textarea
            value={teacherNotes}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={t("classes.show.details.teacherNotesPlaceholder")}
            className="min-h-[300px] rounded-3xl border-none bg-yellow-500/5 focus-visible:ring-yellow-500/20 p-8 font-medium text-lg leading-relaxed resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
