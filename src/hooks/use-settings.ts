import { useEffect, useState } from "react";
import type { SettingsData } from "@/lib/settings.functions";
import { applyAccent, type AccentColor } from "./use-accent";

export const SETTINGS_KEY = "neurosense-settings";

export const DEFAULT_SETTINGS: SettingsData = {
  clinicianName: "Dr. Rohan Mehta",
  clinicianEmail: "r.mehta@neurosense.ai",
  clinicianPhone: "+1 415 555 0142",
  licenseNumber: "MD-204918",
  organization: "NeuroSense Research Lab",
  department: "Movement Disorders",
  patientId: "PT-00421",
  patientName: "Anonymous Subject",
  patientAge: 62,
  patientSex: "male",
  deviceSerial: "NS-EMG-0042",
  firmware: "2.4.1",
  samplingHz: 200,
  tremorThreshold: 4.5,
  emgGain: 1000,
  filterLow: 20,
  filterHigh: 450,
  alertSound: true,
  emailAlerts: true,
  smsAlerts: false,
  alertEmail: "alerts@neurosense.ai",
  alertPhone: "+1 415 555 0199",
  severityFloor: "moderate",
  timezone: "UTC",
  language: "en",
  units: "metric",
  dateFormat: "iso",
  retentionDays: 90,
  anonymizeExports: true,
  shareTelemetry: false,
  reportHeader: "NeuroSense Clinical Report",
  reportFooter: "Confidential — for clinical use only.",
  autoReport: false,
  accentColor: "blue",
  wifiEnabled: false,
  wifiSSID: "",
  wifiPassword: "",
  wifiConnected: false,
  wifiSignalStrength: 0,
};

let cache: SettingsData | null = null;
const listeners = new Set<(s: SettingsData) => void>();

/** Current settings (falls back to defaults during SSR). */
export function readSettings(): SettingsData {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    cache = raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    cache = DEFAULT_SETTINGS;
  }
  return cache;
}

/** Persist settings, apply side effects and notify every subscriber. */
export function writeSettings(next: SettingsData) {
  cache = next;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {}
  applyAccent((next.accentColor ?? "blue") as AccentColor);
  listeners.forEach((l) => l(next));
}

/** Subscribe to the live settings used across the app. */
export function useSettings(): SettingsData {
  const [s, setS] = useState<SettingsData>(DEFAULT_SETTINGS);

  useEffect(() => {
    setS(readSettings());
    const listener = (next: SettingsData) => setS(next);
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) {
        cache = null;
        setS(readSettings());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return s;
}

const SEVERITY_RANK = { low: 0, moderate: 1, high: 2, critical: 3 } as const;

/** Does this tremor level clear the configured alert floor? */
export function passesSeverityFloor(
  level: "NORMAL" | "MILD" | "MODERATE" | "SEVERE",
  floor: SettingsData["severityFloor"],
): boolean {
  const rank = { NORMAL: 0, MILD: 0, MODERATE: 1, SEVERE: 3 }[level];
  return rank >= SEVERITY_RANK[floor];
}

export function formatClock(date: Date, s: SettingsData): string {
  try {
    return date.toLocaleTimeString(undefined, { timeZone: s.timezone, hour12: false });
  } catch {
    return date.toLocaleTimeString();
  }
}

export function formatDay(date: Date, s: SettingsData): string {
  const opts: Intl.DateTimeFormatOptions = { timeZone: s.timezone };
  try {
    if (s.dateFormat === "iso") {
      return new Intl.DateTimeFormat("en-CA", { ...opts, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
    }
    if (s.dateFormat === "us") {
      return new Intl.DateTimeFormat("en-US", { ...opts, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
    }
    return new Intl.DateTimeFormat("en-GB", { ...opts, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
