import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container-center py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-12"
      >
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <FileText className="h-4 w-4" />
            {t("footer.terms", "Terms of Service")}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
            Service <br />
            <span className="text-primary italic">Agreement</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            By using Tablawy OS, you agree to build the future of education with integrity and
            respect.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              1. Acceptable Use
            </h2>
            <p>
              Users must engage in respectful communication. Any form of harassment, cheating, or
              unauthorized access to system resources will result in immediate termination of the
              account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              2. AI Generation
            </h2>
            <p>
              While our AI provides high-quality educational support, users are responsible for
              verifying the accuracy of AI-generated content before using it in formal assessments
              or critical environments.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              3. Payments
            </h2>
            <p>
              Subscription fees for teacher suites and institution hubs are non-refundable once the
              service has been activated for the billing cycle.
            </p>
          </section>

          <div className="p-8 rounded-[2rem] bg-muted/30 border border-primary/5 italic text-sm">
            This is a placeholder terms document for Tablawy OS. A full legal document will be
            provided during the production launch phase.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPage;
