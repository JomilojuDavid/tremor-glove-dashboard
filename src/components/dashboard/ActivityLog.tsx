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
}

const EVENTS = [
  "AI inference completed",
  "Tremor signature detected",
  "Signal noise filtered",
  "Severity classification updated",
  "Sensor data processed",
  "Prediction confidence calculated",
];

export function ActivityLog({
  severity,
}: ActivityLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const idRef = useRef(0);
  const severityRef = useRef(severity);

  severityRef.current = severity;

  useEffect(() => {
    const pushLog = () => {
      idRef.current += 1;

      const currentSeverity = severityRef.current;

      let event: string;

      /*
       * Make the activity log reflect the actual
       * dashboard state instead of randomly generating
       * unrelated medical events.
       */
      if (currentSeverity === "NORMAL") {
        event = "No abnormal tremor detected";
      } else if (currentSeverity === "MILD") {
        event = "Mild tremor signature detected";
      } else if (currentSeverity === "MODERATE") {
        event = "Moderate tremor signature detected";
      } else {
        event = "Severe tremor signature detected";
      }

      /*
       * Occasionally show a processing event.
       */
      if (Math.random() > 0.55) {
        event =
          EVENTS[Math.floor(Math.random() * EVENTS.length)];
      }

      const entry: LogEntry = {
        id: idRef.current,
        time: new Date().toLocaleTimeString(),
        event,
        severity:
          event.includes("tremor") ||
          event.includes("Tremor")
            ? currentSeverity
            : "INFO",
      };

      setLogs((previous) => [
        entry,
        ...previous,
      ].slice(0, 30));
    };

    // Initial entries
    pushLog();
    pushLog();
    pushLog();

    // New event every 2.2 seconds
    const interval = setInterval(
      pushLog,
      2200
    );

    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
     CSV EXPORT
  ------------------------------------------------------- */

  const exportCSV = () => {
    if (logs.length === 0) return;

    const header = "Time,Event,Severity";

    const rows = logs.map((log) => {
      const event = `"${log.event.replace(/"/g, '""')}"`;

      return `${log.time},${event},${log.severity}`;
    });

    const csv = [header, ...rows].join("\n");

    downloadFile(
      "neurosense-activity-log.csv",
      "text/csv;charset=utf-8",
      csv
    );
  };

  /* -------------------------------------------------------
     PRINT / PDF
  ------------------------------------------------------- */

  const exportPDF = () => {
    if (logs.length === 0) return;

    const rows = logs
      .map(
        (log) => `
          <tr>
            <td>${log.time}</td>
            <td>${escapeHTML(log.event)}</td>
            <td>${log.severity}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NeuroSense AI Activity Log</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
            }

            h1 {
              margin-bottom: 4px;
            }

            p {
              color: #666;
              margin-top: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 25px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f3f3f3;
            }
          </style>
        </head>

        <body>
          <h1>NeuroSense AI</h1>

          <p>
            Tremor Detection Activity Log
          </p>

          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Severity</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="glass flex h-full flex-col rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Activity Log
          </div>

          <div className="text-sm font-semibold">
            AI Detection & Device Events
          </div>
        </div>

        {/* Export buttons */}
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

      {/* Log entries */}
      <div className="scrollbar-thin mt-4 max-h-[360px] flex-1 space-y-2 overflow-y-auto pr-1">

        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">

                <span className="font-mono text-[11px] text-muted-foreground">
                  {log.time}
                </span>

                <span className="truncate text-sm">
                  {log.event}
                </span>

              </div>

              <SeverityBadge severity={log.severity} />
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </div>
  );
}

/* -------------------------------------------------------
   SEVERITY BADGE
------------------------------------------------------- */

function SeverityBadge({
  severity,
}: {
  severity: LogEntry["severity"];
}) {
  const map: Record<
    string,
    {
      color: string;
      background: string;
    }
  > = {
    NORMAL: {
      color: "text-success",
      background:
        "bg-success/15 ring-success/30",
    },

    MILD: {
      color: "text-warning",
      background:
        "bg-warning/15 ring-warning/30",
    },

    MODERATE: {
      color: "text-warning",
      background:
        "bg-warning/15 ring-warning/40",
    },

    SEVERE: {
      color: "text-danger",
      background:
        "bg-destructive/15 ring-destructive/40",
    },

    INFO: {
      color: "text-foreground",
      background:
        "bg-white/5 ring-white/10",
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

/* -------------------------------------------------------
   FILE DOWNLOAD
------------------------------------------------------- */

function downloadFile(
  filename: string,
  type: string,
  content: string
) {
  const blob = new Blob(
    [content],
    { type }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------
   HTML ESCAPING
------------------------------------------------------- */

function escapeHTML(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}