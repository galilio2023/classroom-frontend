import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UnauthorizedPageProps {
  reason?: string;
}

const UnauthorizedPage = ({ reason }: UnauthorizedPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {reason || "Sorry, you do not have permission to access this page."}
      </p>
      <Button asChild>
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
