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

  const modelMetrics: ModelMetric[] = [
    { label: "Accuracy", value: "94.8%", trend: "up", icon: <HiOutlineCheck className="h-5 w-5" /> },
    { label: "Precision", value: "92.3%", trend: "stable", icon: <HiOutlineChartBar className="h-5 w-5" /> },
    { label: "Recall", value: "93.1%", trend: "up", icon: <HiOutlineArrowTrendingUp className="h-5 w-5" /> },
    { label: "F1-Score", value: "92.7%", trend: "up", icon: <HiOutlineBeaker className="h-5 w-5" /> },
  ];

  const classLabels = [
    { name: "Normal", count: 4230, percentage: 45.2 },
    { name: "Mild Tremor", count: 2840, percentage: 30.3 },
    { name: "Moderate Tremor", count: 1520, percentage: 16.2 },
    { name: "Severe Tremor", count: 640, percentage: 6.8 },
    { name: "Critical", count: 120, percentage: 1.3 },
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
          <p className="mt-1 text-sm text-muted-foreground">Breakdown of {selectedModel} model inference across severity levels</p>
        </div>

        <div className="space-y-4">
          {classLabels.map((cls, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{cls.name}</span>
                <span className="text-muted-foreground">{cls.count.toLocaleString()} ({cls.percentage}%)</span>
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
          <p className="mt-1 text-sm text-muted-foreground">Last 10 model predictions with confidence scores</p>
        </div>

        <div className="space-y-2">
          {[
            { time: "14:32:45", class: "Moderate Tremor", confidence: 89.2, status: "verified" },
            { time: "14:31:12", class: "Mild Tremor", confidence: 76.5, status: "verified" },
            { time: "14:30:03", class: "Normal", confidence: 94.3, status: "verified" },
            { time: "14:28:51", class: "Mild Tremor", confidence: 71.2, status: "flagged" },
            { time: "14:27:22", class: "Normal", confidence: 91.8, status: "verified" },
          ].map((inf, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-background/20 px-4 py-2.5 text-sm hover:bg-background/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-muted-foreground font-mono text-xs">{inf.time}</span>
                <span className="truncate font-medium">{inf.class}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">{inf.confidence}%</div>
                  <div className={`text-xs ${inf.status === "verified" ? "text-success" : "text-warning"}`}>
                    {inf.status === "verified" ? "✓ Verified" : "⚠ Flagged"}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
              <p className="mt-1 text-sm text-muted-foreground">Inference engine and data quality checks</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-success/15 px-3 py-1.5 text-xs font-medium text-success">
              <HiOutlineCheck className="h-3.5 w-3.5" /> All Systems Nominal
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "Inference Latency", value: "12ms", status: "optimal" },
            { name: "Memory Usage", value: "284 MB", status: "optimal" },
            { name: "Model Version", value: "v3.2.1", status: "current" },
            { name: "Last Updated", value: "2h ago", status: "recent" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-background/20 px-4 py-3">
              <div className="text-xs text-muted-foreground font-medium">{item.name}</div>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="font-semibold">{item.value}</div>
                <div className="text-xs font-medium text-success">✓</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
