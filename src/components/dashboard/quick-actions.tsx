import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface QuickActionCard {
  title: string;
  icon: any;
  heading: string;
  description: string;
  resource: string;
}

interface QuickActionsProps {
  cards: QuickActionCard[];
  list: (resource: string) => void;
}

export const QuickActions = ({ cards, list }: QuickActionsProps) => (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
        {cards.map((card) => (
        <Card 
            key={card.title} 
            className="border-none shadow-lg hover:shadow-2xl group hover:-translate-y-2 transition-all duration-500 bg-white/50 dark:bg-black/20 backdrop-blur-xl"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">{card.title}</CardTitle>
                <div className="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-12">
                    <card.icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-3">
                    <div className="text-sm font-bold mt-1 text-foreground/80">{card.heading}</div>
                </div>
                <p className="text-xs text-muted-foreground mb-8 leading-relaxed font-medium">
                    {card.description}
                </p>
                <Button 
                    variant="ghost"
                    className="w-full justify-between rounded-xl bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all font-bold group-hover:shadow-lg group-hover:shadow-primary/20"
                    onClick={() => card.resource && list(card.resource)}
                >
                    Explore
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
            </CardContent>
        </Card>
        ))}
    </div>
);
