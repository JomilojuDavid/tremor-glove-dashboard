import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowDownTray, HiOutlineDocumentText } from "react-icons/hi2";
import type { Severity } from "@/hooks/use-biosignal";

interface LogEntry { id: number; time: string; event: string; severity: Severity | "INFO"; }

const SAMPLE = [
  "AI inference completed",
  "Tremor signature detected",
  "Calibration verified",
  "Device handshake ok",
  "Signal noise filtered",
  "Severity reclassified",
  "Battery telemetry received",
  "Patient motion event",
];

export function ActivityLog({ severity }: { severity: Severity }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);
  const sevRef = useRef(severity);
  sevRef.current = severity;

  useEffect(() => {
    const push = () => {
      idRef.current += 1;
      const ev = SAMPLE[Math.floor(Math.random() * SAMPLE.length)];
      const roll = Math.random();
      const sev: LogEntry["severity"] =
        roll < 0.15 ? sevRef.current
        : roll < 0.35 ? "INFO"
        : (["NORMAL", "MILD", "MODERATE", "SEVERE"] as const)[Math.floor(Math.random() * 4)];
      setLogs((l) => [
        { id: idRef.current, time: new Date().toLocaleTimeString(), event: ev, severity: sev },
        ...l,
      ].slice(0, 30));
    };
    push(); push(); push();
    const id = setInterval(push, 2200);
    return () => clearInterval(id);
  }, []);

  const exportCSV = () => {
    const csv = ["Time,Event,Severity", ...logs.map((l) => `${l.time},${l.event},${l.severity}`)].join("\n");
    download("neurosense-log.csv", "text/csv", csv);
  };
  const exportPDF = () => {
    // Lightweight: export printable HTML as .pdf-ready text
    const html = `Time\tEvent\tSeverity\n${logs.map((l) => `${l.time}\t${l.event}\t${l.severity}`).join("\n")}`;
    download("neurosense-log.txt", "text/plain", html);
  };

  return (
    <div className="glass flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Activity Log</div>
          <div className="text-sm font-semibold">AI Detection & Device Events</div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-xs hover:bg-white/5">
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={exportPDF} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-xs hover:bg-white/5">
            <HiOutlineDocumentText className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      <div className="scrollbar-thin mt-4 max-h-[360px] flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {logs.map((l) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="font-mono text-[11px] text-muted-foreground">{l.time}</span>
                <span className="truncate text-sm">{l.event}</span>
              </div>
              <SevBadge sev={l.severity} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SevBadge({ sev }: { sev: LogEntry["severity"] }) {
  const map: Record<string, { c: string; bg: string }> = {
    NORMAL:   { c: "text-success",     bg: "bg-success/15 ring-success/30" },
    MILD:     { c: "text-warning",     bg: "bg-warning/15 ring-warning/30" },
    MODERATE: { c: "text-warning",     bg: "bg-warning/15 ring-warning/40" },
    SEVERE:   { c: "text-danger",      bg: "bg-destructive/15 ring-destructive/40" },
    INFO:     { c: "text-foreground",  bg: "bg-white/5 ring-white/10" },
  };
  const m = map[sev];
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${m.bg} ${m.c}`}>{sev}</span>;
}

function download(name: string, type: string, content: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
