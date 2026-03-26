import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Printer, Share2, Eye } from "lucide-react";
import { Certificate } from "./certificate";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Mock data for demonstration
const MOCK_CERTIFICATES = [
  {
    id: "CERT-2024-001",
    courseName: "Advanced Mathematics 101",
    teacherName: "Dr. Sarah Smith",
    date: "May 15, 2024",
    grade: "A",
  },
  {
    id: "CERT-2024-002",
    courseName: "Introduction to Physics",
    teacherName: "Prof. Alan Turing",
    date: "June 20, 2024",
    grade: "A-",
  },
];

interface CertificateGalleryProps {
  studentName: string;
  isOwner: boolean;
}

export const CertificateGallery = ({
  studentName,
  isOwner,
}: CertificateGalleryProps) => {
  const { t } = useTranslation();
  const [selectedCert, setSelectedCert] = useState(MOCK_CERTIFICATES[0]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/certificates/${id}`;
    navigator.clipboard.writeText(url);
    toast.success(t("common.insightCopied"));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CERTIFICATES.map((cert) => (
          <Card
            key={cert.id}
            className="group hover:shadow-lg transition-all duration-300 border-primary/10 overflow-hidden"
          >
            <div className="h-32 bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-dot-pattern opacity-30" />
              <Award className="w-16 h-16 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute bottom-2 end-2">
                <span className="bg-background/80 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full border shadow-sm">
                  {cert.date}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                {cert.courseName}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {t("common.certificate.instructor")}: {cert.teacherName}
              </p>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t("buttons.view")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none overflow-hidden">
                    <div className="relative flex flex-col items-center">
                      <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                        <Certificate
                          ref={printRef}
                          studentName={studentName}
                          courseName={selectedCert.courseName}
                          teacherName={selectedCert.teacherName}
                          date={selectedCert.date}
                          completionId={selectedCert.id}
                        />
                      </div>
                      <div className="flex gap-4 mt-4 no-print">
                        <Button
                          onClick={handlePrint}
                          className="gap-2 shadow-xl"
                        >
                          <Printer className="w-4 h-4" />
                          {t("buttons.printReport")}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleShare(selectedCert.id)}
                          className="gap-2 shadow-xl"
                        >
                          <Share2 className="w-4 h-4" />
                          {t("buttons.share")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleShare(cert.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
