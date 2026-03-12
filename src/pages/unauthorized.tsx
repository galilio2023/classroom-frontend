import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface UnauthorizedPageProps {
  reason?: string;
}

const UnauthorizedPage = ({ reason }: UnauthorizedPageProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">{t("library.accessDenied")}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {reason || t("library.accessDeniedDesc", "Sorry, you do not have permission to access this page.")}
      </p>
      <Button asChild>
        <Link to="/">{t("buttons.goBack")}</Link>
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
