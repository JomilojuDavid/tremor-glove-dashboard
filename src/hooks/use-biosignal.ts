import { useEffect, useRef, useState } from "react";

export interface WaveformPoint { t: number; v: number; }
export interface SpectrumPoint { f: number; mag: number; }
export interface RmsPoint { t: number; rms: number; }

export type Severity = "NORMAL" | "MILD" | "MODERATE" | "SEVERE";

export interface BioSnapshot {
  waveform: WaveformPoint[];
  spectrum: SpectrumPoint[];
  rms: RmsPoint[];
  frequency: number;        // Hz
  amplitude: number;        // g
  rmsCurrent: number;
  severity: Severity;
  severityScore: number;    // 0 - 100
  confidence: number;       // 0 - 100
  signalStrength: number;   // 0 - 100
  totalReadings: number;
  aiAccuracy: number;       // 0 - 100
}

const WINDOW = 120;

function classify(score: number): Severity {
  if (score < 25) return "NORMAL";
  if (score < 50) return "MILD";
  if (score < 75) return "MODERATE";
  return "SEVERE";
}

export function useBioSignal(): BioSnapshot {
  const [snap, setSnap] = useState<BioSnapshot>(() => ({
    waveform: Array.from({ length: WINDOW }, (_, i) => ({ t: i, v: 0 })),
    spectrum: Array.from({ length: 32 }, (_, i) => ({ f: i, mag: 0 })),
    rms: Array.from({ length: 40 }, (_, i) => ({ t: i, rms: 0.2 })),
    frequency: 5.2,
    amplitude: 0.4,
    rmsCurrent: 0.3,
    severity: "NORMAL",
    severityScore: 12,
    confidence: 96,
    signalStrength: 92,
    totalReadings: 0,
    aiAccuracy: 97.2,
  }));
  const tRef = useRef(0);
  const driftRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tRef.current += 1;
      // Gentle severity drift to demo all states
      driftRef.current += (Math.random() - 0.48) * 2.2;
      const score = Math.max(4, Math.min(96, 30 + 25 * Math.sin(tRef.current / 60) + driftRef.current));
      const sev = classify(score);
      const amp = 0.25 + (score / 100) * 1.4;
      const freq = 4 + (score / 100) * 8 + Math.sin(tRef.current / 12) * 0.6;

      setSnap((prev) => {
        const next: WaveformPoint = {
          t: tRef.current,
          v:
            Math.sin(tRef.current * 0.35) * amp +
            Math.sin(tRef.current * 0.9) * amp * 0.4 +
            (Math.random() - 0.5) * amp * 0.5,
        };
        const waveform = [...prev.waveform.slice(1), next];
        const spectrum = Array.from({ length: 32 }, (_, i) => {
          const center = freq;
          const d = Math.abs(i - center);
          return { f: i, mag: Math.max(0, amp * (1 / (1 + d * 0.6)) + Math.random() * 0.05) };
        });
        const rmsCurrent = Math.sqrt(
          waveform.slice(-30).reduce((s, p) => s + p.v * p.v, 0) / 30,
        );
        const rmsPoint: RmsPoint = { t: tRef.current, rms: rmsCurrent };
        const rms = [...prev.rms.slice(1), rmsPoint];

        return {
          waveform,
          spectrum,
          rms,
          frequency: +freq.toFixed(2),
          amplitude: +amp.toFixed(2),
          rmsCurrent: +rmsCurrent.toFixed(3),
          severity: sev,
          severityScore: +score.toFixed(1),
          confidence: +(88 + Math.random() * 11).toFixed(1),
          signalStrength: +(80 + Math.random() * 19).toFixed(0),
          totalReadings: prev.totalReadings + 1,
          aiAccuracy: +(96 + Math.random() * 3).toFixed(1),
        };
      });
    }, 180);
    return () => clearInterval(id);
  }, []);

  return snap;
}

export const severityColor = (s: Severity) =>
  s === "NORMAL" ? "var(--color-success)"
  : s === "MILD" ? "var(--color-warning)"
  : s === "MODERATE" ? "oklch(0.72 0.17 55)"
  : "var(--color-destructive)";
