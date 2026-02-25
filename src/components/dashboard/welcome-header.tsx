import { User } from "@/types";

interface WelcomeHeaderProps {
  name: string;
  isStudent: boolean;
}

export const WelcomeHeader = ({ name, isStudent }: WelcomeHeaderProps) => (
  <div className="mb-8 md:mb-12 space-y-2">
    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
        Welcome back, {name || "User"}!
    </h1>
    <p className="text-muted-foreground text-lg md:text-xl font-medium tracking-tight">
      {isStudent ? "Ready to continue your learning journey?" : "Here is your management overview for today."}
    </p>
  </div>
);
