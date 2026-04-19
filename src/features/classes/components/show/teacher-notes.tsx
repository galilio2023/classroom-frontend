import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Sparkles } from "lucide-react";
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
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-3xl rounded-4xl md:rounded-[2.5rem] overflow-hidden flex flex-col h-full group">
      <CardHeader className="p-6 md:p-10 pb-4 md:pb-6 border-b border-border/40 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
            <FileText className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          {t("classes.show.details.teacherNotes")}
        </CardTitle>
        {isLoadingNotes && (
          <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent className="p-6 md:p-10 flex-1 relative min-h-62.5 md:min-h-75">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

        <div className="relative h-full">
          <Textarea
            value={teacherNotes}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={t("classes.show.details.notesPlaceholder")}
            className="w-full h-full min-h-50 md:min-h-62.5 resize-none border-none bg-muted/20 focus-visible:ring-primary/20 rounded-2xl md:rounded-3xl p-6 md:p-8 text-base md:text-lg leading-relaxed font-medium shadow-inner placeholder:text-muted-foreground/40 italic"
          />
          {/* Sparkle hint for private notes */}
          <div className="absolute bottom-4 end-4 flex items-center gap-2 pointer-events-none opacity-40">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">
              Private
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
