import { motion } from "framer-motion";
import type { Severity } from "@/hooks/use-biosignal";

interface SeverityGaugeProps {
  score: number;
  severity: Severity;
}

export function SeverityGauge({
  score,
  severity,
}: SeverityGaugeProps) {
  // Half-circle gauge
  const r = 90;
  const c = Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;

  const colorStops = [
    {
      offset: "0%",
      color: "var(--color-success)",
    },
    {
      offset: "45%",
      color: "var(--color-warning)",
    },
    {
      offset: "75%",
      color: "oklch(0.72 0.17 55)",
    },
    {
      offset: "100%",
      color: "var(--color-destructive)",
    },
  ];

  const severityColor =
    severity === "NORMAL"
      ? "var(--color-success)"
      : severity === "MILD"
        ? "var(--color-warning)"
        : severity === "MODERATE"
          ? "oklch(0.72 0.17 55)"
          : "var(--color-destructive)";

  return (
    <div className="glass flex flex-col items-center rounded-2xl p-5">
      {/* Header */}
      <div className="w-full">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Tremor Severity
        </div>

        <div className="mt-1 text-sm font-semibold">
          AI Severity Index
        </div>

        <div className="mt-1 text-[11px] text-muted-foreground">
          Classification-based visualization
        </div>
      </div>

      {/* Gauge */}
      <div className="relative mt-2">
        <svg
          width="240"
          height="140"
          viewBox="0 0 240 140"
          role="img"
          aria-label={`Tremor severity score ${score}`}
        >
          <defs>
            <linearGradient
              id="gaugeGrad"
              x1="0"
              x2="1"
            >
              {colorStops.map((s) => (
                <stop
                  key={s.offset}
                  offset={s.offset}
                  stopColor={s.color}
                />
              ))}
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d="M30,120 A90,90 0 0 1 210,120"
            fill="none"
            stroke="oklch(1 0 0 / 0.08)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active gauge */}
          <motion.path
            d="M30,120 A90,90 0 0 1 210,120"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            initial={false}
            animate={{
              strokeDasharray: `${dash} ${c}`,
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 18,
            }}
            style={{
              filter: "drop-shadow(0 0 8px var(--color-primary))",
            }}
          />
        </svg>

        {/* Score */}
        <div className="absolute inset-x-0 bottom-2 text-center">
          <motion.div
            key={Math.round(score)}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-4xl font-bold tracking-tight"
          >
            {score.toFixed(0)}
          </motion.div>

          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Index
          </div>
        </div>
      </div>

      {/* Classification */}
      <div
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs"
        style={{
          borderColor: `${severityColor}55`,
        }}
      >
        <span
          className="h-2 w-2 rounded-full pulse-ring"
          style={{
            color: severityColor,
            background: "currentColor",
          }}
        />

        <span className="text-muted-foreground">
          AI Classification:
        </span>

        <span
          className="font-semibold"
          style={{
            color: severityColor,
          }}
        >
          {severity}
        </span>
      </div>

      {/* Explanation */}
      <div className="mt-3 text-center text-[11px] text-muted-foreground">
        Higher values indicate greater tremor classification severity.
      </div>
    </div>
  );
}