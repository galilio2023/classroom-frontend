import { 
  Megaphone, 
  Loader2, 
  Send, 
  PlusCircle, 
  Paperclip, 
  CheckCircle2 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  setData: (data: any) => void;
  isCreating: boolean;
  isUploading: boolean;
  onUpload: (e: any) => void;
  onCreate: () => void;
}

export const CreateAnnouncementDialog = ({ 
  isOpen, onOpenChange, data, setData, isCreating, isUploading, onUpload, onCreate 
}: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <PlusCircle className="h-4 w-4" />{t("classes.announcements.new")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit"><Megaphone className="h-6 w-6" /></div>
          <DialogTitle className="text-2xl font-black tracking-tight">{t("classes.announcements.createTitle")}</DialogTitle>
          <DialogDescription className="font-medium">{t("classes.announcements.createDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("classes.announcements.fieldTitle")}</Label>
            <Input placeholder="e.g., Upcoming Midterm Exam" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="h-12 rounded-xl bg-muted/20 border-none font-bold" />
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("classes.announcements.fieldContent")}</Label>
            <Textarea placeholder="Provide all necessary details here..." rows={5} value={data.content} onChange={(e) => setData({ ...data, content: e.target.value })} className="min-h-[150px] rounded-2xl bg-muted/20 border-none p-5 text-sm leading-relaxed" />
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("classes.announcements.fieldAttachment")}</Label>
            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/10">
              <div className="relative flex-1">
                <Input type="file" onChange={onUpload} disabled={isUploading} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
                <div className="flex items-center gap-3 text-muted-foreground/60">
                  <div className="p-2 rounded-lg bg-background shadow-sm"><Paperclip className="h-4 w-4" /></div>
                  <span className="text-xs font-bold uppercase tracking-widest">{isUploading ? t("buttons.uploading") : t("buttons.selectFile")}</span>
                </div>
              </div>
              {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {data.fileUrl && <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success bg-success/10 px-3 py-1.5 rounded-full"><CheckCircle2 className="h-3 w-3" />{t("assignments.create.attached")}</div>}
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <Checkbox id="pin" checked={data.isPinned} onCheckedChange={(c) => setData({ ...data, isPinned: !!c })} />
            <div className="space-y-0.5">
              <Label htmlFor="pin" className="text-sm font-black tracking-tight cursor-pointer">{t("classes.announcements.fieldPin")}</Label>
              <p className="text-[10px] text-muted-foreground font-medium">{t("classes.announcements.pinDesc")}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="ghost" className="rounded-xl font-bold h-12" onClick={() => onOpenChange(false)}>{t("buttons.cancel")}</Button>
          <Button className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20" onClick={onCreate} disabled={isCreating || isUploading || !data.title || !data.content}>
            {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {t("buttons.postAnnouncement")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
