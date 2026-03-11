import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "AI Study Lab", href: "#ai" },
        { name: "Pricing", href: "/pricing" },
        { name: "Collaborative Whiteboard", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Privacy Policy", href: "#" },
        { name: "Contact", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-muted/10 border-t pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">
                Class<span className="text-primary">Room</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xs">
              The next generation of education. AI-powered tools, collaborative environments, and enterprise-grade classroom management.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary font-bold transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Newsletter</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Join our mailing list for latest updates on AI in education.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="email@example.com" 
                className="bg-background rounded-xl border-none shadow-inner h-12 font-bold"
              />
              <Button size="icon" className="rounded-xl h-12 w-12 shrink-0 shadow-lg shadow-primary/20">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
            © {currentYear} Classroom CMS. All rights reserved.
          </p>
          <div className="flex gap-8">
             <span className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer">Security</span>
             <span className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer">Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
