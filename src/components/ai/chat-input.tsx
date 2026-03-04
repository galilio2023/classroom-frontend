import React from "react";
import { CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSend,
  isLoading,
}) => {
  return (
    <CardFooter className="p-4 border-t bg-muted/20">
      <form 
        className="flex w-full items-center space-x-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-background border-muted-foreground/20 focus-visible:ring-primary/30 h-11 rounded-xl"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </CardFooter>
  );
};
