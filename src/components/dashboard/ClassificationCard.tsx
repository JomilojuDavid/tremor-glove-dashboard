import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import type { ConnectionStatus, Severity } from "@/hooks/use-biosignal";

const meta: Record<
  Severity,
  {
    color: string;
    ring: string;
    glow: string;
  }
> = {
  NORMAL: {
    color: "var(--color-success)",
    ring: "ring-success/40",
    glow: "glow-success",
  },

  MILD: {
    color: "var(--color-warning)",
    ring: "ring-warning/40",
    glow: "glow-warning",
  },

  SEVERE: {
    color: "var(--color-destructive)",
    ring: "ring-destructive/60",
    glow: "glow-danger",
  },
};

interface ClassificationCardProps {
  severity: Severity;
  confidence: number | null;
  predictionLabel: string | null;
  recommendation: string;
  hasPrediction: boolean;
  connectionStatus: ConnectionStatus;
}

export function ClassificationCard({
  severity,
  confidence,
  predictionLabel,
  recommendation,
  hasPrediction,
  connectionStatus,
}: ClassificationCardProps) {
  const m = meta[severity];
  const statusLabel = connectionStatus === "connected"
    ? "AI Online"
    : connectionStatus === "disconnected"
      ? "AI Offline"
      : "Checking";

  return (
    <div
      className={`glass relative overflow-hidden rounded-2xl p-6 ring-1 ${m.ring}`}
    >
      {/* Background glow */}
      <div
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: m.color }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <HiOutlineSparkles className="h-4 w-4" />
              AI Tremor Classification
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Random Forest inference
            </div>
          </div>

          {/* AI status */}
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${connectionStatus === "connected" ? "border-success/20 bg-success/10 text-success" : connectionStatus === "disconnected" ? "border-danger/20 bg-danger/10 text-danger" : "border-warning/20 bg-warning/10 text-warning"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connectionStatus === "connected" ? "bg-success" : connectionStatus === "disconnected" ? "bg-danger" : "bg-warning"}`} />
            {statusLabel}
          </div>
        </div>

        {/* Main classification */}
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Current Prediction
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${severity}-${predictionLabel ?? "waiting"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mt-1 text-5xl font-bold tracking-tight md:text-6xl"
                style={{
                  color: m.color,
                  textShadow: `0 0 24px ${m.color}`,
                }}
              >
                {hasPrediction ? severity : "WAITING"}
              </motion.div>
            </AnimatePresence>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {hasPrediction ? predictionLabel : "Waiting for sensor data."}
            </p>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-5">
            <div className="relative grid h-24 w-24 place-items-center">
              <span
                className={`absolute inset-0 rounded-full ${m.glow}`}
                style={{
                  background: `radial-gradient(circle, ${m.color}33, transparent 70%)`,
                }}
              />

              <span
                className="absolute inset-2 rounded-full pulse-ring"
                style={{
                  color: m.color,
                  border: `2px solid ${m.color}`,
                }}
              />

              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: m.color }}
                >
                  {confidence === null ? "—" : `${confidence.toFixed(2)}%`}
                </div>

                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Confidence
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Model Confidence</span>
            <span>{confidence === null ? "—" : `${confidence.toFixed(2)}%`}</span>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-background/60">
            <motion.div
              key={confidence}
              initial={{ width: 0 }}
              animate={{
                width: `${confidence === null ? 0 : Math.min(100, Math.max(0, confidence))}%`,
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${m.color}, var(--color-primary))`,
              }}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-background/30 p-4">
          <div
            className="mt-0.5 rounded-lg p-2"
            style={{
              background: `${m.color}18`,
              color: m.color,
            }}
          >
            <HiOutlineShieldCheck className="h-4 w-4" />
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">
              Recommendation
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              {hasPrediction ? recommendation || "Not available" : "Waiting for sensor data."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}