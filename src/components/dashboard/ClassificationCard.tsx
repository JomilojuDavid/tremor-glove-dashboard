import { motion, AnimatePresence } from "framer-motion";
import type { Severity } from "@/hooks/use-biosignal";

const meta: Record<Severity, { color: string; ring: string; glow: string; desc: string }> = {
  NORMAL:   { color: "var(--color-success)",     ring: "ring-success/40",  glow: "glow-success", desc: "Tremor activity within healthy baseline." },
  MILD:     { color: "var(--color-warning)",     ring: "ring-warning/40",  glow: "glow-warning", desc: "Low-amplitude oscillation detected." },
  MODERATE: { color: "oklch(0.72 0.17 55)",      ring: "ring-warning/60",  glow: "glow-warning", desc: "Sustained tremor signature — observe trend." },
  SEVERE:   { color: "var(--color-destructive)", ring: "ring-destructive/60", glow: "glow-danger", desc: "High-intensity tremor — clinical alert." },
};

export function ClassificationCard({ severity, confidence }: { severity: Severity; confidence: number }) {
  const m = meta[severity];
  return (
    <div className={`glass relative overflow-hidden rounded-2xl p-6 ring-1 ${m.ring}`}>
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: m.color }} />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AI Tremor Classification</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={severity}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="mt-2 text-5xl font-bold tracking-tight md:text-6xl"
              style={{ color: m.color, textShadow: `0 0 24px ${m.color}` }}
            >
              {severity}
            </motion.div>
          </AnimatePresence>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{m.desc}</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative grid h-24 w-24 place-items-center">
            <span className={`absolute inset-0 rounded-full ${m.glow}`} style={{ background: `radial-gradient(circle, ${m.color}33, transparent 70%)` }} />
            <span
              className="absolute inset-2 rounded-full pulse-ring"
              style={{ color: m.color, border: `2px solid ${m.color}` }}
            />
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: m.color }}>{confidence.toFixed(0)}%</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-background/60">
        <motion.div
          key={confidence}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${m.color}, var(--color-primary))` }}
        />
      </div>
    </div>
  );
}
