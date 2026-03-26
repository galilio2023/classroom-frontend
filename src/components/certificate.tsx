import React from "react";
import { cn } from "@/lib/utils";
import { Award, Medal, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CertificateProps {
  studentName: string;
  courseName: string;
  teacherName: string;
  date: string;
  completionId: string;
  className?: string;
}

export const Certificate = React.forwardRef<HTMLDivElement, CertificateProps>(
  (
    { studentName, courseName, teacherName, date, completionId, className },
    ref,
  ) => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    return (
      <div
        ref={ref}
        dir={isArabic ? "rtl" : "ltr"}
        className={cn(
          "printable-certificate w-[800px] h-[600px] bg-white text-black p-8 relative overflow-hidden shadow-2xl mx-auto",
          className,
        )}
        style={{
          fontFamily: isArabic
            ? "'Cairo', sans-serif"
            : "'Times New Roman', serif",
        }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-4 border-4 border-double border-primary/40 pointer-events-none" />
        <div className="absolute inset-6 border border-primary/20 pointer-events-none" />

        {/* Corner Ornaments */}
        <div className="absolute top-8 start-8 w-16 h-16 border-t-4 border-s-4 border-primary/60" />
        <div className="absolute top-8 end-8 w-16 h-16 border-t-4 border-e-4 border-primary/60" />
        <div className="absolute bottom-8 start-8 w-16 h-16 border-b-4 border-s-4 border-primary/60" />
        <div className="absolute bottom-8 end-8 w-16 h-16 border-b-4 border-e-4 border-primary/60" />

        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-96 h-96" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Star className="w-6 h-6 fill-primary" />
              <Star className="w-8 h-8 fill-primary -mt-2" />
              <Star className="w-6 h-6 fill-primary" />
            </div>
            <h1 className="text-5xl font-bold uppercase tracking-widest text-primary">
              {t("common.certificate.title")}
            </h1>
            <h2 className="text-2xl font-light tracking-widest uppercase text-muted-foreground">
              {t("common.certificate.ofCompletion")}
            </h2>
          </div>

          <div className="w-full max-w-2xl h-px bg-linear-to-r from-transparent via-primary/40 to-transparent my-4" />

          {/* Body */}
          <div className="space-y-8 w-full max-w-3xl">
            <p className="text-xl italic text-muted-foreground">
              {t("common.certificate.thisCertifies")}
            </p>

            <div className="border-b-2 border-primary/20 pb-2 px-8 inline-block min-w-[400px]">
              <h3 className="text-4xl font-bold text-foreground font-serif italic">
                {studentName}
              </h3>
            </div>

            <p className="text-xl italic text-muted-foreground">
              {t("common.certificate.successfullyCompleted")}
            </p>

            <div className="border-b-2 border-primary/20 pb-2 px-8 inline-block min-w-[500px]">
              <h3 className="text-3xl font-bold text-primary font-serif">
                {courseName}
              </h3>
            </div>
          </div>

          {/* Footer / Signatures */}
          <div className="flex justify-between items-end w-full max-w-3xl mt-12 px-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-48 border-b border-black/40 mb-1" />
              <p className="text-lg font-bold font-serif">{date}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {t("common.certificate.date")}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <Medal className="w-20 h-20 text-gold-primary drop-shadow-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-white drop-shadow-md">
                    {t("common.certificate.passed")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-48 border-b border-black/40 mb-1 flex items-end justify-center pb-1">
                <span className="font-signature text-2xl text-primary">
                  {teacherName}
                </span>
              </div>
              <p className="text-lg font-bold font-serif">{teacherName}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {t("common.certificate.instructor")}
              </p>
            </div>
          </div>

          {/* ID */}
          <div className="absolute bottom-4 start-0 end-0 text-center">
            <p className="text-[10px] text-muted-foreground font-mono">
              {t("common.certificate.id", { id: completionId })}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

Certificate.displayName = "Certificate";
