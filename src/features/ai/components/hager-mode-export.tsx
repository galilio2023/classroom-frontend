import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FileDown, Heart } from "lucide-react";
import { toast } from "sonner";

/**
 * 👩‍🏫 HagerModeExport
 * Specialized high-fidelity PDF export for classroom handouts.
 * Optimized for Egyptian printing standards: Precise Arabic typography + LaTeX.
 */
export const HagerModeExport: React.FC<{
  content: string;
  title: string;
  type?: "lesson" | "assignment" | "audit";
}> = ({ content, title }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const direction = isAr ? "rtl" : "ltr";
    const textAlign = isAr ? "right" : "left";

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            body { 
              font-family: 'Cairo', sans-serif; 
              padding: 40px; 
              line-height: 1.6; 
              direction: ${direction};
              text-align: ${textAlign};
            }
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; }
            .school-logo { font-size: 24px; font-weight: 900; color: #4f46e5; }
            .content { font-size: 16px; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; pt: 20px; font-size: 10px; color: #666; text-align: center; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-logo">Tablawy OS x Institutional Hub</div>
            <h1>${title}</h1>
            <p>${new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US")}</p>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            Generated via Tablawy OS "Hager Mode" - Institutional Grade AI
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(t("common.export.success", "Exporting high-fidelity handout..."));
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className="rounded-full font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 transition-all group"
    >
      <Heart className="h-4 w-4 text-pink-500 fill-pink-500 group-hover:scale-110 transition-transform" />
      {t("buttons.hagerModeExport", "Hager Mode: PDF Handout")}
      <FileDown className="h-3.5 w-3.5 opacity-50" />
    </Button>
  );
};
