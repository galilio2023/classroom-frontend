import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Trophy,
  Settings2,
  Info,
  Rocket,
  Target,
  Gauge,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface PhysicsLabProps {
  onComplete?: (score: number) => void;
  targetDistance?: number; // meters
  gravity?: number; // m/s^2
}

export const PhysicsLab: React.FC<PhysicsLabProps> = ({
  onComplete,
  targetDistance = 150,
  gravity = 9.8,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game State
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(40);
  const [isFiring, setIsStreaming] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [bestDistance, setBestDistance] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [trajectory, setTrajectory] = useState<{ x: number; y: number }[]>([]);

  // Simulation Variables
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const targetX = targetDistance;
  const tolerance = 5; // Success if within 5 meters

  const resetSim = () => {
    setIsStreaming(false);
    setTrajectory([]);
    cancelAnimationFrame(animationRef.current);
  };

  const fire = () => {
    if (isFiring) return;
    setIsStreaming(true);
    setAttempts((prev) => prev + 1);
    setTrajectory([]);
    startTimeRef.current = performance.now();
    animate();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentTime = (performance.now() - startTimeRef.current) / 1000; // time in seconds
    const timeScale = 2; // Speed up the simulation
    const tVal = currentTime * timeScale;

    // Kinematics Formulas
    const v0x = velocity * Math.cos((angle * Math.PI) / 180);
    const v0y = velocity * Math.sin((angle * Math.PI) / 180);

    const x = v0x * tVal;
    const y = v0y * tVal - 0.5 * gravity * Math.pow(tVal, 2);

    // Scaling for canvas (1 meter = 4 pixels)
    const scale = 4;
    const canvasX = x * scale + 50;
    const canvasY = canvas.height - 50 - y * scale;

    // Update Trajectory
    if (y >= 0) {
      setTrajectory((prev) => [...prev, { x: canvasX, y: canvasY }]);

      // Draw everything
      draw(ctx, canvasX, canvasY);

      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Hit the ground
      setIsStreaming(false);
      setBestDistance(x);

      const distanceDiff = Math.abs(x - targetX);
      if (distanceDiff <= tolerance) {
        setShowWin(true);
        onComplete?.(100);
        toast.success(t("physics.lab.targetHit" as any, "Direct Hit!"), {
          description: t("physics.lab.scoreMsg" as any, "You've mastered projectile motion!"),
          icon: <Trophy className="text-yellow-500" />,
        });
      } else {
        toast.info(t("physics.lab.missed" as any, "Missed!"), {
          description:
            x < targetX
              ? t("physics.lab.tooShort" as any, "A bit short. Try more power!")
              : t("physics.lab.tooLong" as any, "Over-shot the target. Adjust your angle."),
        });
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, currentX: number, currentY: number) => {
    const canvas = canvasRef.current!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Grid / Background
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // 2. Draw Target
    const targetCanvasX = targetX * 4 + 50;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(targetCanvasX, canvas.height - 50, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(targetCanvasX, canvas.height - 50, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(targetCanvasX, canvas.height - 50, 3, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Cannon Base
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(30, canvas.height - 60, 40, 20);

    // 4. Draw Trajectory Path
    if (trajectory.length > 1) {
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#94a3b8";
      ctx.moveTo(trajectory[0].x, trajectory[0].y);
      for (let i = 1; i < trajectory.length; i++) {
        ctx.lineTo(trajectory[i].x, trajectory[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Draw Projectile
    ctx.fillStyle = "#3b82f6";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#3b82f6";
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx, 50, canvas.height - 50);
    }
  }, []);

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Rocket className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              {t("physics.lab.title", "Kinematics Lab")}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {t("physics.lab.desc", "Hit the target using the laws of projectile motion.")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary font-bold gap-2"
          >
            <Target className="h-4 w-4" />
            {attempts} {t("physics.lab.attempts", "Attempts")}
          </Badge>
          <Badge
            variant="outline"
            className="h-10 px-4 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-600 font-bold gap-2"
          >
            <Gauge className="h-4 w-4" />
            {bestDistance.toFixed(1)}m {t("physics.lab.distance", "Distance")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <Card className="lg:col-span-1 rounded-4xl border-none shadow-xl bg-muted/30 backdrop-blur-sm">
          <CardContent className="p-6 space-y-8">
            <div className="space-y-6">
              <div className="space-y-4 text-start">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("physics.lab.angle", "Launch Angle")}
                  </label>
                  <span className="font-black text-primary">{angle}°</span>
                </div>
                <Slider
                  value={[angle]}
                  onValueChange={(v) => setAngle(v[0])}
                  max={90}
                  step={1}
                  disabled={isFiring}
                />
              </div>

              <div className="space-y-4 text-start">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("physics.lab.velocity", "Initial Velocity")}
                  </label>
                  <span className="font-black text-primary">{velocity} m/s</span>
                </div>
                <Slider
                  value={[velocity]}
                  onValueChange={(v) => setVelocity(v[0])}
                  max={100}
                  step={1}
                  disabled={isFiring}
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={fire}
                disabled={isFiring}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 gap-2"
              >
                {isFiring ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {t("physics.lab.launch", "Launch Projectile")}
              </Button>
              <Button
                variant="outline"
                onClick={resetSim}
                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] border-muted-foreground/20"
              >
                <RotateCcw className="h-4 w-4 me-2" />
                {t("buttons.reset" as any)}
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3 text-start">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">
                  Pro Tip
                </p>
                <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {t(
                    "physics.lab.tip",
                    "Try a 45° angle for maximum horizontal range in a vacuum."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <div className="lg:col-span-3 relative group">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-muted/10 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-full object-contain"
            />

            <AnimatePresence>
              {showWin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-emerald-600/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 space-y-6"
                >
                  <div className="p-6 rounded-full bg-white/20 shadow-inner">
                    <Trophy className="h-20 w-20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white tracking-tight">
                      MISSION SUCCESS
                    </h2>
                    <p className="text-emerald-50/80 font-bold max-w-sm">
                      {t(
                        "physics.lab.winMsg",
                        "You accurately calculated the trajectory and hit the target within tolerance!"
                      )}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowWin(false)}
                      className="bg-white text-emerald-600 hover:bg-emerald-50 h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                      {t("buttons.tryAgain")}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                      {t("buttons.done" as any)}
                    </Button>
                  </div>
                  <Sparkles className="absolute top-10 end-10 h-12 w-12 text-white/20 animate-pulse" />
                  <Sparkles className="absolute bottom-10 start-10 h-8 w-8 text-white/20 animate-pulse delay-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
};
