import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineArrowDownTray,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import type { Severity } from "@/hooks/use-biosignal";

interface LogEntry {
  id: number;
  time: string;
  event: string;
  severity: Severity | "INFO";
}

interface ActivityLogProps {
  severity: Severity;
  predictionLabel: string | null;
  timestamp?: string | null;
  connectionStatus?: "connected" | "disconnected" | "checking";
}

export function ActivityLog({
  severity,
  predictionLabel,
  timestamp,
  connectionStatus = "checking",
}: ActivityLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const previousTimestamp = useRef<string | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (
      connectionStatus !== "connected" ||
      !timestamp ||
      timestamp === previousTimestamp.current
    ) return;

    previousTimestamp.current = timestamp;
    idRef.current += 1;

    const entry: LogEntry = {
      id: idRef.current,
      time: new Date(timestamp).toLocaleTimeString(),
      event: `AI prediction updated: ${predictionLabel ?? severity}`,
      severity,
    };

    setLogs((previous) => [entry, ...previous].slice(0, 30));
  }, [severity, predictionLabel, timestamp, connectionStatus]);

  const exportCSV = () => {
    if (logs.length === 0) return;

    const header = "Time,Event,Severity";
    const rows = logs.map((log) => {
      const event = `"${log.event.replace(/"/g, '""')}"`;
      return `${log.time},${event},${log.severity}`;
    });

    downloadFile(
      "neurosense-activity-log.csv",
      "text/csv;charset=utf-8",
      [header, ...rows].join("\n"),
    );
  };

  const exportPDF = () => {
    if (logs.length === 0) return;

    const rows = logs
      .map(
        (log) => `
          <tr>
            <td>${escapeHTML(log.time)}</td>
            <td>${escapeHTML(log.event)}</td>
            <td>${escapeHTML(log.severity)}</td>
          </tr>
        `,
      )
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700",
    );

    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NeuroSense AI Activity Log</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            h1 { margin-bottom: 4px; }
            p { color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h1>NeuroSense AI</h1>
          <p>Tremor Detection Activity Log</p>
          <table>
            <thead>
              <tr><th>Time</th><th>Event</th><th>Severity</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="glass flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Activity Log
          </div>
          <div className="text-sm font-semibold">
            AI Detection & Device Events
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-xs transition-colors hover:bg-white/5"
          >
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
            CSV
          </button>

          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-xs transition-colors hover:bg-white/5"
          >
            <HiOutlineDocumentText className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>

      <div className="scrollbar-thin mt-4 max-h-[360px] flex-1 space-y-2 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="rounded-xl border border-border bg-background/30 px-3 py-6 text-center text-sm text-muted-foreground">
            Waiting for live backend readings...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {log.time}
                  </span>
                  <span className="truncate text-sm">{log.event}</span>
                </div>

                <SeverityBadge severity={log.severity} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: LogEntry["severity"] }) {
  const map: Record<string, { color: string; background: string }> = {
    NORMAL: {
      color: "text-success",
      background: "bg-success/15 ring-success/30",
    },
    MILD: {
      color: "text-warning",
      background: "bg-warning/15 ring-warning/30",
    },
    SEVERE: {
      color: "text-danger",
      background: "bg-destructive/15 ring-destructive/40",
    },
    INFO: {
      color: "text-foreground",
      background: "bg-white/5 ring-white/10",
    },
  };

  const style = map[severity];

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${style.background} ${style.color}`}
    >
      {severity}
    </span>
  );
}

function downloadFile(filename: string, type: string, content: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHTML(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
