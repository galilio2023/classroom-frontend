import { useGetIdentity, useLogout } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { 
  ShieldAlert, 
  LogOut, 
  Clock, 
  FileText, 
  CheckCircle2,
  Mail,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PendingVerificationPage = () => {
  const { data: identity, refetch } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-amber-500">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full animate-pulse">
              <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Account Pending Verification</CardTitle>
          <CardDescription className="text-base">
            Hello, <span className="font-semibold text-foreground">{identity?.name}</span>. Your teacher account is currently under review.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex gap-4">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-400">
              <p className="font-semibold mb-1">Why am I seeing this?</p>
              <p>To maintain the quality of our platform, all teacher accounts must be manually verified by an administrator before they can create classes or interact with students.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Verification Status
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Pending Review
                </Badge>
                <span className="text-[10px] text-muted-foreground">Submitted on {identity?.createdAt ? new Date(identity.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                What's Next?
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our team usually reviews applications within 24-48 hours. You'll receive an email once your account is active.
              </p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Need to update your credentials or have questions?
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="link" className="text-xs h-auto p-0 gap-1.5">
                <Mail className="h-3 w-3" />
                Contact Support
              </Button>
              <Button 
                variant="link" 
                className="text-xs h-auto p-0 gap-1.5"
                onClick={() => refetch()}
              >
                <RefreshCcw className="h-3 w-3" />
                Check Status
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t bg-slate-50/50 dark:bg-slate-950/50 py-4 px-6 rounded-b-xl">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <div className="flex-1" />
          <p className="text-[10px] text-muted-foreground text-center sm:text-right">
            Logged in as {identity?.email}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PendingVerificationPage;
