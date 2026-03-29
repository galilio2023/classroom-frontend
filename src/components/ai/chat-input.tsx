import React from "react";
import { CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSend, isLoading }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <CardFooter className="p-4 md:p-6 border-t border-border/40 bg-card/60 backdrop-blur-xl">
      <form
        className="flex w-full items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          placeholder={t("classes.reader.askPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-muted/40 border-none shadow-inner h-12 md:h-14 rounded-2xl md:rounded-[1.25rem] px-4 md:px-6 font-medium placeholder:text-muted-foreground/50 focus-visible:ring-primary/20 text-sm md:text-base"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-[1.25rem] shadow-lg shadow-ai-primary/20 transition-all active:scale-95 shrink-0 bg-ai-primary hover:bg-ai-primary/90 text-white"
        >
          <Send className={cn("h-4 w-4 md:h-5 md:w-5", isAr && "rotate-180")} />
        </Button>
      </form>
    </CardFooter>
  );
};
