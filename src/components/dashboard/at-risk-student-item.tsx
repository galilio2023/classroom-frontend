import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, UserX, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreate } from "@refinedev/core";
import { toast } from "sonner";
import axios from "axios";

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
}

interface AtRiskStudentItemProps {
  student: AtRiskStudent;
}

export const AtRiskStudentItem: React.FC<AtRiskStudentItemProps> = ({
  student,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { mutate: sendNotification, mutation } = useCreate();
  const isSending = mutation.isPending;

  const generateEncouragement = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post("/api/ai/generate-encouragement", {
        studentName: student.name,
        reason: student.reason,
        value: student.value,
      });
      setMessage(response.data.message);
    } catch (error) {
      const fallbacks: Record<string, string> = {
        "Low Grades": `Hi ${student.name}, I noticed your recent grades have been a bit lower than usual. I know you can do better! Is there anything I can help you with?`,
        "High Absences": `Hello ${student.name}, we've missed you in class lately! Regular attendance is key to success. Hope everything is okay.`,
        Inactivity: `Hi ${student.name}, I noticed you haven't logged in for a few days. Don't fall behind on the latest modules! Let me know if you're stuck.`,
      };
      setMessage(
        fallbacks[student.reason] ||
          `Hi ${student.name}, just checking in to see how you're doing with your studies.`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    sendNotification(
      {
        resource: "notifications",
        values: {
          userId: student.id,
          title: "Message from your Teacher",
          message: message,
          type: "achievement",
        },
      },
      {
        onSuccess: () => {
          toast.success(`Encouragement sent to ${student.name}!`);
          setIsModalOpen(false);
          setMessage("");
        },
      },
    );
  };

  return (
    <>
      <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-destructive/10 hover:border-destructive/30 transition-colors group">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-destructive/20">
            <AvatarImage src={student.image} />
            <AvatarFallback>{student.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-none">{student.name}</p>
            <div className="flex items-center gap-1 mt-1">
              {student.reason === "Low Grades" ? (
                <TrendingDown className="h-3 w-3 text-destructive" />
              ) : (
                <UserX className="h-3 w-3 text-destructive" />
              )}
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {student.reason}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="destructive"
            className="text-[10px] font-black px-2 py-0.5"
          >
            {student.value}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => setIsModalOpen(true)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Encourage {student.name}
            </DialogTitle>
            <DialogDescription>
              Send a supportive message to help them get back on track.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Message
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                onClick={generateEncouragement}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                AI Suggest
              </Button>
            </div>
            <Textarea
              placeholder="Type your message here..."
              className="min-h-30 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
            >
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
