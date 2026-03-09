import { useGetIdentity, useLogout, useNavigation } from "@refinedev/core";
import { User, UserRole, VerificationStatus } from "@/types";
import { 
  ShieldAlert, 
  LogOut, 
  Clock, 
  FileText, 
  CheckCircle2,
  Mail,
  RefreshCcw,
  ShieldCheck
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
import { useEffect } from "react";
import { toast } from "sonner";

const PendingVerificationPage = () => {
  const { data: identity, refetch, isLoading } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();
  const { push } = useNavigation() as any;

  // Auto-redirect if verified
  useEffect(() => {
    if (!isLoading && identity) {
      const isVerified = identity.verificationStatus === VerificationStatus.VERIFIED;
      const isAdmin = identity.role === UserRole.ADMIN;
      const isStudent = identity.role === UserRole.STUDENT;

      // If already verified or not a teacher, go to dashboard
      if (isVerified || isAdmin || isStudent) {
        push("/");
      }
    }
  }, [identity, isLoading, push]);

  const handleCheckStatus = async () => {
    const { data } = await refetch();
    if (data) {
      const isVerified = data.verificationStatus === VerificationStatus.VERIFIED;
      if (isVerified) {
        toast.success("Account verified! Redirecting...");
        push("/");
      } else {
        toast.info("Status updated: Still pending review.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-amber-500 overflow-hidden">
        <CardHeader className="text-center space-y-1 pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full animate-pulse">
                <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border shadow-sm">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">Verification Pending</CardTitle>
          <CardDescription className="text-base font-medium">
            Hello, <span className="text-foreground font-bold">{identity?.name}</span>. Your teacher account is currently under review.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg h-fit">
              <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
              <p className="font-bold mb-1">Why is this required?</p>
              <p>To ensure a safe learning environment, all teacher credentials must be manually verified by our administration team before you can access classroom features.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Current Status
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold px-3 py-1">
                  Pending Approval
                </Badge>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Submitted on {identity?.createdAt ? new Date(identity.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Estimated Time
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Our team typically reviews applications within <span className="text-foreground font-bold">24-48 hours</span>. You will receive an email notification once your account is activated.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-sm text-muted-foreground font-medium">
              Need to update your credentials or have questions?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="rounded-xl h-10 px-4 gap-2 font-bold text-xs" asChild>
                <a href="mailto:support@classroom.ai">
                  <Mail className="h-3.5 w-3.5" />
                  Contact Support
                </a>
              </Button>
              <Button 
                variant="secondary" 
                className="rounded-xl h-10 px-4 gap-2 font-bold text-xs"
                onClick={handleCheckStatus}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh Status
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 border-t bg-muted/30 py-6 px-8">
          <Button 
            variant="ghost" 
            className="w-full sm:w-auto gap-2 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl" 
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <div className="flex-1" />
          <div className="flex flex-col items-center sm:items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Logged in as
            </p>
            <p className="text-xs font-bold truncate max-w-[200px]">
              {identity?.email}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PendingVerificationPage;
