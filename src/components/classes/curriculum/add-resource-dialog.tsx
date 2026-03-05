import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";

interface AddResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resource: {
    title: string;
    description: string;
    type: "file" | "link" | "video" | "note" | "other";
    url: string;
    content: string;
    cldPubId: string;
  };
  setResource: (res: any) => void;
  onSave: () => void;
}

export const AddResourceDialog = ({
  isOpen,
  onOpenChange,
  resource,
  setResource,
  onSave
}: AddResourceDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader><DialogTitle>Add Material</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title</Label><Input value={resource.title} onChange={(e) => setResource({ ...resource, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={resource.type} onValueChange={(v: any) => setResource({ ...resource, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="note">Note</SelectItem><SelectItem value="file">File</SelectItem><SelectItem value="link">Link</SelectItem></SelectContent></Select></div>
          </div>
          {resource.type === "note" && <Textarea className="min-h-50" value={resource.content} onChange={(e) => setResource({ ...resource, content: e.target.value })} />}
          {resource.type === "file" && <FileUpload onUploadSuccess={(url, pubId) => setResource({ ...resource, url, cldPubId: pubId })} />}
        </div>
        <DialogFooter><Button onClick={onSave}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
