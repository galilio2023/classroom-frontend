import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface PromoCardsProps {
  isStaff: boolean;
  list: (resource: string) => void;
}

export const PromoCards = ({ isStaff, list }: PromoCardsProps) => (
    <>
        {isStaff && (
            <Card className="relative group cursor-pointer overflow-hidden border-none shadow-2xl bg-ai-secondary/30 backdrop-blur-xl" onClick={() => list("ai-assistant")}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                    <Sparkles className="h-20 w-20 text-ai-primary" />
                </div>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-3 font-black">
                        <Sparkles className="h-6 w-6 text-ai-primary animate-pulse" />
                        AI Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        Unlock the power of <span className="text-ai-primary font-bold">Gemini AI</span> to generate quizzes, assignments, and get instant study help.
                    </p>
                    <Button className="w-full bg-ai-primary hover:bg-ai-primary/90 border-none font-black rounded-xl shadow-lg shadow-ai-primary/20 group-hover:gap-4 transition-all text-ai-primary-foreground">
                        Try it now <ArrowRight className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        )}

        {!isStaff && (
            <Card className="border-none shadow-xl bg-primary/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Student Support
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-4">
                    <p>Need help with your studies? Use the <strong>AI Study Buddy</strong> inside any of your class pages for instant assistance.</p>
                    <Button variant="outline" className="w-full rounded-xl font-bold text-[10px] uppercase tracking-widest">Contact Support</Button>
                </CardContent>
            </Card>
        )}
    </>
);
