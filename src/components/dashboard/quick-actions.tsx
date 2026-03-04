import React from "react";
import { QuickAction, QuickActionCard } from "./quick-action-card";

interface QuickActionsProps {
  cards: QuickAction[];
  list: (resource: string) => void;
}

export const QuickActions = ({ cards, list }: QuickActionsProps) => (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
        {cards.map((card) => (
            <QuickActionCard 
                key={card.title} 
                action={card} 
                onAction={list} 
            />
        ))}
    </div>
);
