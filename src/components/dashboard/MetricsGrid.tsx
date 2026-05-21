import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IconType } from "react-icons";
import {
  TbWaveSine, TbActivityHeartbeat, TbBrain, TbClockHour4, TbAntennaBars5, TbDatabaseDollar,
} from "react-icons/tb";

interface Metric {
  icon: IconType;
  label: string;
  value: number;
  unit: string;
  trend: number; // %
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
      if (k < 1) raf = requestAnimationFrame(tick);
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
  const up = m.trend >= 0;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group glass relative overflow-hidden rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: `${m.color}1f`, color: m.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-[11px] font-medium ${up ? "text-success" : "text-danger"}`}>
          {up ? "▲" : "▼"} {Math.abs(m.trend).toFixed(1)}%
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{v.toFixed(v < 10 ? 2 : 0)}</span>
        <span className="text-xs text-muted-foreground">{m.unit}</span>
      </div>
      <div className="text-xs text-muted-foreground">{m.label}</div>
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30"
        style={{ background: m.color }}
      />
    </motion.div>
  );
}

interface Props {
  frequency: number; amplitude: number; aiAccuracy: number;
  monitoringMin: number; signal: number; totalReadings: number;
}

export function MetricsGrid(p: Props) {
  const metrics: Metric[] = [
    { icon: TbWaveSine,           label: "Tremor Frequency",   value: p.frequency,      unit: "Hz",  trend: 1.4,  color: "var(--color-primary)" },
    { icon: TbActivityHeartbeat,  label: "Peak Amplitude",     value: p.amplitude,      unit: "g",   trend: -0.6, color: "var(--color-warning)" },
    { icon: TbBrain,              label: "AI Accuracy",        value: p.aiAccuracy,     unit: "%",   trend: 0.3,  color: "var(--color-success)" },
    { icon: TbClockHour4,         label: "Monitoring Time",    value: p.monitoringMin,  unit: "min", trend: 2.1,  color: "var(--color-primary)" },
    { icon: TbAntennaBars5,       label: "Signal Strength",    value: p.signal,         unit: "%",   trend: 0.9,  color: "var(--color-success)" },
    { icon: TbDatabaseDollar,     label: "Total Readings",     value: p.totalReadings,  unit: "",    trend: 4.6,  color: "var(--color-warning)" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map((m) => <Card key={m.label} m={m} />)}
    </div>
  );
}
