import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Menu, 
  X, 
  Sparkles,
  Layers,
  Zap,
  BookOpen
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features", icon: <Layers className="h-4 w-4" /> },
    { name: "AI Study Lab", href: "/#ai", icon: <Sparkles className="h-4 w-4" /> },
    { name: "Pricing", href: "/pricing", icon: <Crown className="h-4 w-4" /> },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-border py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            Class<span className="text-primary">Room</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="font-bold uppercase tracking-widest text-xs">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="font-black uppercase tracking-widest text-xs rounded-xl px-6 shadow-lg shadow-primary/20">
              Get Started
              <Zap className="ml-2 h-4 w-4 fill-current" />
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-widest flex items-center gap-4"
                >
                  <div className="p-2 rounded-lg bg-muted">{link.icon}</div>
                  {link.name}
                </Link>
              ))}
              <hr />
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-black uppercase tracking-widest py-6 rounded-2xl">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full font-black uppercase tracking-widest py-6 rounded-2xl">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
