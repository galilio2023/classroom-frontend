import { motion, AnimatePresence } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { useRefineOptions } from "@refinedev/core";
import {
  SidebarHeader as ShadcnSidebarHeader,
  SidebarTrigger as ShadcnSidebarTrigger,
  useSidebar as useShadcnSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarHeader() {
  const { title } = useRefineOptions();
  const { open, isMobile } = useShadcnSidebar();

  return (
    <ShadcnSidebarHeader
      className={cn(
        "p-0 h-20 border-b border-border/40 flex items-center overflow-hidden bg-transparent transition-all duration-300",
        !open && !isMobile ? "justify-center" : "flex-row justify-between px-6"
      )}
    >
      <AnimatePresence mode="wait">
        {(open || isMobile) && (
          <motion.div
            key="logo-full"
            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <RouterLink to="/" className="flex flex-row items-center gap-3 whitespace-nowrap group">
              <div className="shrink-0 p-2.5 bg-primary/10 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                {title.icon}
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-black tracking-tight text-foreground leading-none mb-0.5">
                  {title.text}
                </h2>
                <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">
                  {open ? "Learning Management" : ""}
                </span>
              </div>
            </RouterLink>
          </motion.div>
        )}
      </AnimatePresence>
      <ShadcnSidebarTrigger
        className={cn(
          "text-muted-foreground/60 hover:text-primary transition-all duration-300 shrink-0 opacity-100 pointer-events-auto",
          { "me-0": !open && !isMobile }
        )}
      />
    </ShadcnSidebarHeader>
  );
}
