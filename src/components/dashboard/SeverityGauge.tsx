import { motion } from "framer-motion";
import type { Severity } from "@/hooks/use-biosignal";

export function SeverityGauge({ score, severity }: { score: number; severity: Severity }) {
  // Half-circle gauge
  const r = 90;
  const c = Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;

  const colorStops = [
    { offset: "0%",   color: "var(--color-success)" },
    { offset: "45%",  color: "var(--color-warning)" },
    { offset: "75%",  color: "oklch(0.72 0.17 55)" },
    { offset: "100%", color: "var(--color-destructive)" },
  ];

  return (
    <div className="glass flex flex-col items-center rounded-2xl p-5">
      <div className="self-start">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tremor Severity</div>
        <div className="text-sm font-semibold">Realtime Index</div>
      </div>

      <div className="relative mt-2">
        <svg width="240" height="140" viewBox="0 0 240 140">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" x2="1">
              {colorStops.map((s) => <stop key={s.offset} offset={s.offset} stopColor={s.color} />)}
            </linearGradient>
          </defs>
          <path
            d="M30,120 A90,90 0 0 1 210,120"
            fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="14" strokeLinecap="round"
          />
          <motion.path
            d="M30,120 A90,90 0 0 1 210,120"
            fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            initial={false}
            animate={{ strokeDasharray: `${dash} ${c}` }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            style={{ filter: "drop-shadow(0 0 8px var(--color-primary))" }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-2 text-center">
          <motion.div
            key={Math.round(score)}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            {score.toFixed(0)}
          </motion.div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Severity Score</div>
        </div>
      </div>

      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs">
        <span
          className="h-2 w-2 rounded-full pulse-ring"
          style={{
            color:
              severity === "NORMAL" ? "var(--color-success)" :
              severity === "MILD" ? "var(--color-warning)" :
              severity === "MODERATE" ? "oklch(0.72 0.17 55)" :
              "var(--color-destructive)",
            background: "currentColor",
          }}
        />
        Status: <span className="font-semibold">{severity}</span>
      </div>
    </div>
  );
}
