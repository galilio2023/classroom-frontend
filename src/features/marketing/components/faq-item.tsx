import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  question: string;
  answer: string;
}

export const FAQItem = ({ question, answer }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/40 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-start group transition-all"
      >
        <span className="text-lg md:text-xl font-bold tracking-tight group-hover:text-primary transition-colors pe-4">
          {question}
        </span>
        <div
          className={cn(
            "p-2.5 rounded-full bg-muted/30 border border-border/50 transition-all duration-500 shrink-0",
            isOpen &&
              "rotate-180 bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary"
          )}
        >
          {isOpen ? (
            <Minus className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="pb-8 text-base md:text-lg text-muted-foreground/80 font-medium leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
