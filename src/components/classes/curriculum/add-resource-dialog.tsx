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

interface ResourceState {
  title: string;
  description: string;
  type: "file" | "link" | "video" | "note" | "other";
  url: string;
  content: string;
  cldPubId: string;
}

interface AddResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ResourceState;
  setResource: (res: ResourceState) => void;
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>Add Material</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title</Label><Input value={resource.title} onChange={(e) => setResource({ ...resource, title: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={resource.type} 
                onValueChange={(v: ResourceState["type"]) => setResource({ ...resource, type: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(resource.type === "link" || resource.type === "video" || resource.type === "other") && (
             <div className="space-y-2">
               <Label>URL</Label>
               <Input 
                 placeholder="https://..." 
                 value={resource.url} 
                 onChange={(e) => setResource({ ...resource, url: e.target.value })} 
               />
             </div>
          )}

          {resource.type === "note" && (
            <Textarea 
              className="min-h-[200px]" 
              value={resource.content} 
              onChange={(e) => setResource({ ...resource, content: e.target.value })} 
            />
          )}
          
          {resource.type === "file" && (
            <FileUpload 
              onUploadSuccess={(url, pubId) => setResource({ ...resource, url, cldPubId: pubId })} 
            />
          )}
        </div>
        <DialogFooter><Button onClick={onSave}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
