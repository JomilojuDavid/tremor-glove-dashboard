import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HiOutlineExclamationTriangle, HiOutlineSignal, HiOutlineCpuChip } from "react-icons/hi2";
import type { Severity } from "@/hooks/use-biosignal";

interface Toast { id: number; kind: "severe" | "device" | "ai"; msg: string; }

export function ToastHost({ severity }: { severity: Severity }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const lastSevereRef = useRef(0);

  const push = (t: Omit<Toast, "id">) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((arr) => [...arr, { id, ...t }]);
    setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 4500);
  };

  useEffect(() => {
    if (severity === "SEVERE" && Date.now() - lastSevereRef.current > 8000) {
      lastSevereRef.current = Date.now();
      push({ kind: "severe", msg: "Severe tremor detected — recommend clinical review." });
    }
  }, [severity]);

  useEffect(() => {
    const a = setInterval(() => push({ kind: "ai", msg: "AI analysis cycle completed." }), 14000);
    const b = setTimeout(() => push({ kind: "device", msg: "NS-AX-2041 calibration verified." }), 2500);
    return () => { clearInterval(a); clearTimeout(b); };
  }, []);

  const meta = {
    severe: { c: "text-danger",   ring: "ring-destructive/40", Icon: HiOutlineExclamationTriangle },
    device: { c: "text-success",  ring: "ring-success/40",     Icon: HiOutlineSignal },
    ai:     { c: "text-primary",  ring: "ring-primary/40",     Icon: HiOutlineCpuChip },
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
