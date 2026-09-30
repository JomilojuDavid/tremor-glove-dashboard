import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCpuChip,
  HiOutlineChartBar,
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTrendingUp,
  HiOutlineBeaker,
} from "react-icons/hi2";
import { useBioSignal } from "@/hooks/use-biosignal";

export const Route = createFileRoute("/ai")({
  component: AIPage,
  head: () => ({ meta: [{ title: "AI Analysis Workbench — NeuroSense AI" }] }),
});

interface ModelMetric {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
  icon: React.ReactNode;
}

function AIPage() {
  const [selectedModel, setSelectedModel] = useState("primary");
  const bio = useBioSignal();

  const modelMetrics: ModelMetric[] = [
    { label: "Accuracy", value: "Not available", icon: <HiOutlineCheck className="h-5 w-5" /> },
    { label: "Precision", value: "Not available", icon: <HiOutlineChartBar className="h-5 w-5" /> },
    { label: "Recall", value: "Not available", icon: <HiOutlineArrowTrendingUp className="h-5 w-5" /> },
    { label: "F1-Score", value: "Not available", icon: <HiOutlineBeaker className="h-5 w-5" /> },
  ];

  const classLabels = [
    { name: "Normal", percentage: 0 },
    { name: "Mild Tremor", percentage: 0 },
    { name: "Severe Tremor", percentage: 0 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Model Insights</div>
        <h1 className="mt-1 text-2xl font-semibold">AI Analysis Workbench</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-time model performance, inference logs, and classification distribution.
        </p>
      </header>

      {/* Model Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["primary", "backup", "ensemble"].map((model) => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            className={`flex-shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors capitalize ${
              selectedModel === model
                ? "border-primary bg-primary/15 text-primary glow-primary"
                : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {model} Model
          </button>
        ))}
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {modelMetrics.map((metric, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-6 border border-border/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-muted-foreground">{metric.label}</div>
                <div className="mt-2 text-2xl font-semibold">{metric.value}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                {metric.icon}
              </div>
            </div>
            {metric.trend && (
              <div className="mt-3 text-xs font-medium">
                <span className={metric.trend === "up" ? "text-success" : metric.trend === "down" ? "text-danger" : "text-warning"}>
                  {metric.trend === "up" ? "↑ Improving" : metric.trend === "down" ? "↓ Declining" : "→ Stable"}
                </span>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Classification Distribution */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-6"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Classification Distribution</h2>
          <p className="mt-1 text-sm text-muted-foreground">Classification distribution is not provided by the backend.</p>
        </div>

        <div className="space-y-4">
          {classLabels.map((cls, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{cls.name}</span>
                <span className="text-muted-foreground">Not available</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cls.percentage}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Recent Inferences */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-6"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Recent Inferences</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest backend prediction</p>
        </div>

        <div className="space-y-2">
          {bio.hasPrediction && bio.timestamp ? (
            <div
              key={bio.timestamp}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-background/20 px-4 py-2.5 text-sm hover:bg-background/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-muted-foreground font-mono text-xs">{new Date(bio.timestamp).toLocaleTimeString()}</span>
                <span className="truncate font-medium">{bio.predictionLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">{bio.confidence === null ? "—" : `${bio.confidence.toFixed(2)}%`}</div>
                  <div className="text-xs text-success">
                    Backend
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-background/20 px-4 py-6 text-center text-sm text-muted-foreground">
              Waiting for sensor data...
            </div>
          )}
        </div>
      </motion.section>

      {/* Model Health */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-6"
      >
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Model Health</h2>
              <p className="mt-1 text-sm text-muted-foreground">Model health details are not provided by the backend.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Not available
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "Inference Latency", value: "Not available" },
            { name: "Memory Usage", value: "Not available" },
            { name: "Model Version", value: "Not available" },
            { name: "Last Updated", value: "Not available" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-background/20 px-4 py-3">
              <div className="text-xs text-muted-foreground font-medium">{item.name}</div>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="font-semibold">{item.value}</div>
                <div className="text-xs text-muted-foreground">—</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
