import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const PrivacyPage = () => {
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
            <ShieldCheck className="h-4 w-4" />
            {t("footer.privacy", "Privacy Policy")}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
            Your Privacy <br />
            <span className="text-primary italic">Matters</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            We are committed to protecting your data and ensuring a safe learning environment for
            everyone.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              1. Data Collection
            </h2>
            <p>
              We collect information you provide directly to us when you create an account, such as
              your name, email address, and profile details.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              2. Law 151 Compliance
            </h2>
            <p>
              In accordance with Egyptian Law 151 (Data Protection), we implement strict security
              measures to protect your personal identity information. National IDs and contact
              details are stored using enterprise-grade encryption.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              3. AI Safety
            </h2>
            <p>
              AI-generated content is monitored for safety and compliance. We do not use your
              personal private data to train public foundation models without explicit consent.
            </p>
          </section>

          <div className="p-8 rounded-[2rem] bg-muted/30 border border-primary/5 italic text-sm">
            This is a placeholder policy for Tablawy OS. A full legal document will be provided
            during the production launch phase.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;
