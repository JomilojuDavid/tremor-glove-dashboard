import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  TbWaveSine,
  TbActivityHeartbeat,
  TbBrain,
  TbClockHour4,
  TbAntennaBars5,
  TbDatabase,
} from "react-icons/tb";

interface Metric {
  icon: IconType;
  label: string;
  value: number;
  unit: string;
  color: string;
}

function useCount(target: number) {
  const [v, setV] = useState(target);

  useEffect(() => {
    const start = v;
    const delta = target - start;

    if (Math.abs(delta) < 0.01) return;

    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 400);

      setV(start + delta * k);

      if (k < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return v;
}

function Card({ m }: { m: Metric }) {
  const v = useCount(m.value);
  const Icon = m.icon;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group glass relative overflow-hidden rounded-2xl p-4"
    >
      {/* Icon */}
      <div className="flex items-center justify-between">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{
            background: `${m.color}1f`,
            color: m.color,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Live
        </span>
      </div>

      {/* Value */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">
          {v.toFixed(v < 10 ? 2 : 0)}
        </span>

        {m.unit && (
          <span className="text-xs text-muted-foreground">
            {m.unit}
          </span>
        )}
      </div>

      {/* Label */}
      <div className="text-xs text-muted-foreground">
        {m.label}
      </div>

      {/* Hover glow */}
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30"
        style={{
          background: m.color,
        }}
      />
    </motion.div>
  );
}

interface Props {
  frequency: number;
  amplitude: number;
  aiAccuracy: number;
  monitoringMin: number;
  signal: number;
  totalReadings: number;
}

export function MetricsGrid(p: Props) {
  const metrics: Metric[] = [
    {
      icon: TbWaveSine,
      label: "Tremor Frequency",
      value: p.frequency,
      unit: "Hz",
      color: "var(--color-primary)",
    },

    {
      icon: TbActivityHeartbeat,
      label: "Peak Amplitude",
      value: p.amplitude,
      unit: "g",
      color: "var(--color-warning)",
    },

    {
      icon: TbBrain,
      label: "Model Accuracy",
      value: p.aiAccuracy,
      unit: "%",
      color: "var(--color-success)",
    },

    {
      icon: TbClockHour4,
      label: "Monitoring Time",
      value: p.monitoringMin,
      unit: "min",
      color: "var(--color-primary)",
    },

    {
      icon: TbAntennaBars5,
      label: "Signal Quality",
      value: p.signal,
      unit: "%",
      color: "var(--color-success)",
    },

    {
      icon: TbDatabase,
      label: "Sensor Readings",
      value: p.totalReadings,
      unit: "",
      color: "var(--color-warning)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map((m) => (
        <Card key={m.label} m={m} />
      ))}
    </div>
  );
}