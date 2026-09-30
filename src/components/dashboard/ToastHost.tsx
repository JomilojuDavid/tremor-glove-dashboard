import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import type { ConnectionStatus, Severity } from "@/hooks/use-biosignal";

interface Toast { id: number; kind: "severe"; msg: string; }

export function ToastHost({
  severity,
  recommendation,
  timestamp,
  connectionStatus,
}: {
  severity: Severity;
  recommendation: string;
  timestamp: string | null;
  connectionStatus: ConnectionStatus;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const lastTimestampRef = useRef<string | null>(null);
  const timersRef = useRef(new Set<number>());

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (
      connectionStatus !== "connected" ||
      severity !== "SEVERE" ||
      !timestamp ||
      timestamp === lastTimestampRef.current
    ) return;

    lastTimestampRef.current = timestamp;
    idRef.current += 1;
    const id = idRef.current;
    setToasts((items) => [...items, { id, kind: "severe", msg: recommendation }]);
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 4500);
    timersRef.current.add(timer);
  }, [connectionStatus, severity, timestamp, recommendation]);

  const meta = {
    severe: { c: "text-danger", ring: "ring-destructive/40", Icon: HiOutlineExclamationTriangle },
  } as const;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const m = meta[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              className={`glass pointer-events-auto flex items-start gap-3 rounded-xl p-3 ring-1 ${m.ring}`}
            >
              <m.Icon className={`mt-0.5 h-5 w-5 ${m.c}`} />
              <div className="text-sm">{t.msg}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
