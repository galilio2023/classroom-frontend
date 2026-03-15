import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Globe,
  Heart,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import React from "react";

// --- Custom Brand Icons to replace deprecated Lucide ones ---
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
// -----------------------------------------------------------

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const footerLinks = [
    {
      id: "platform",
      title: t("footer.platform", "Platform"),
      links: [
        {
          id: "coreFeatures",
          name: t("footer.coreFeatures", "Core Features"),
          href: "/#features",
        },
        {
          id: "aiLearning",
          name: t("footer.aiLearning", "AI Learning Hub"),
          href: "/#ai",
        },
        {
          id: "whiteboard",
          name: t("footer.whiteboard", "Interactive Whiteboard"),
          href: "#",
        },
        {
          id: "studentProgress",
          name: t("footer.studentProgress", "Student Progress"),
          href: "#",
        },
      ],
    },
    {
      id: "solutions",
      title: t("footer.solutions", "Solutions"),
      links: [
        {
          id: "forSchools",
          name: t("footer.forSchools", "For Schools"),
          href: "#",
        },
        {
          id: "forTeachers",
          name: t("footer.forTeachers", "For Teachers"),
          href: "#",
        },
        {
          id: "caseStudies",
          name: t("footer.caseStudies", "Case Studies"),
          href: "#",
        },
        {
          id: "enterprise",
          name: t("footer.enterprise", "Enterprise"),
          href: "#",
        },
      ],
    },
    {
      id: "support",
      title: t("footer.support", "Support"),
      links: [
        {
          id: "helpCenter",
          name: t("footer.helpCenter", "Help Center"),
          href: "#",
        },
        {
          id: "community",
          name: t("footer.community", "Community"),
          href: "#",
        },
        {
          id: "contactUs",
          name: t("footer.contactUs", "Contact Us"),
          href: "#",
        },
        { id: "apiDocs", name: t("footer.apiDocs", "API Docs"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative bg-background pt-32 pb-12 overflow-hidden border-t border-primary/5">
      {/* Decorative background with bg-linear-to-r update */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Newsletter / CTA Section */}
        <div className="bg-muted/30 rounded-[3rem] p-12 md:p-16 mb-24 border border-primary/5 backdrop-blur-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 group">
          {/* RTL Positioning Fix */}
          <div className="absolute -top-10 -right-10 rtl:-left-10 rtl:right-auto w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

          <div className="max-w-md space-y-4 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              <Zap className="h-3 w-3 fill-current" />
              {t("footer.joinRevolution", "Join the Revolution")}
            </div>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
              {t("footer.readyToUpgrade", "Ready to upgrade your")}{" "}
              <br className="hidden md:block" />
              <span className="text-primary not-italic">
                {t("footer.learningExperience", "Learning Experience?")}
              </span>
            </h3>
            <p className="text-muted-foreground font-medium">
              {t(
                "footer.subscribeDesc",
                "Subscribe to our weekly insights on AI in modern education.",
              )}
            </p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder={t("footer.emailPlaceholder", "you@university.edu")}
                className="bg-background rounded-2xl border-none shadow-inner h-16 font-bold px-6 text-lg text-start focus-visible:ring-primary/20"
                dir="ltr"
              />
              <Button
                size="icon"
                className="rounded-2xl h-16 w-16 shrink-0 shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all group/btn"
              >
                <ArrowRight
                  className={cn(
                    "h-6 w-6 group-hover/btn:translate-x-1 transition-transform",
                    isAr && "rotate-180 group-hover/btn:-translate-x-1",
                  )}
                />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center lg:text-start opacity-60">
              {t("footer.noSpam", "NO SPAM. JUST PURE INNOVATION.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <BookOpen className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">
                Class<span className="text-primary not-italic">Room</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-sm">
              {t(
                "footer.brandDesc",
                "The next generation of education. AI-powered tools, collaborative environments, and enterprise-grade classroom management.",
              )}
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <GithubIcon className="h-5 w-5" />, label: "Github" },
                { icon: <TwitterIcon className="h-5 w-5" />, label: "Twitter" },
                {
                  icon: <LinkedinIcon className="h-5 w-5" />,
                  label: "Linkedin",
                },
                { icon: <Mail className="h-5 w-5" />, label: "Email" },
              ].map((social, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  aria-label={social.label}
                  className="h-12 w-12 rounded-xl bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {social.icon}
                </Button>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.id} className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      to={link.href}
                      // RTL Translation Hover Fix
                      className="text-sm text-muted-foreground hover:text-primary font-bold transition-all hover:translate-x-1 rtl:hover:-translate-x-1 flex items-center gap-2 group"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
              &copy; {currentYear}{" "}
              {t("footer.rightsReserved", "Tablawy OS. All rights reserved.")}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t("footer.builtWith", "Built with")}{" "}
              <Heart className="h-3 w-3 text-red-500 fill-current" />{" "}
              {t("footer.byTeam", "by Senior Team")}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <Link
              to="/terms"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              {t("footer.terms", "Terms of Service")}
            </Link>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              {t("footer.privacy", "Privacy Policy")}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              {t("footer.cookie", "Cookie Policy")}
            </span>
          </div>

          <div className="flex items-center gap-6 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t("footer.soc2", "SOC2 COMPLIANT")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t("footer.gdpr", "GDPR READY")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
