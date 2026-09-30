import { createContext, useContext, useEffect, useState } from "react";

export interface WaveformPoint {
  t: number;
  v: number;
}

export interface SpectrumPoint {
  f: number;
  mag: number;
}

export interface RmsPoint {
  t: number;
  rms: number;
}

export type Severity = "NORMAL" | "MILD" | "SEVERE";

export type ConnectionStatus = "connected" | "disconnected" | "checking";

export interface BioSnapshot {
  waveform: WaveformPoint[];
  spectrum: SpectrumPoint[];
  rms: RmsPoint[];

  frequency: number | null;
  amplitude: number | null;
  rmsCurrent: number | null;

  severity: Severity;
  predictionLabel: string | null;
  severityScore: number | null;
  confidence: number | null;

  signalStrength: number | null;
  aiAccuracy: number | null;

  sensor: SensorData | null;
  recommendation: string;
  timestamp: string | null;
  hasPrediction: boolean;
  connectionStatus: ConnectionStatus;
  wifiSSID: string | null;
}

export interface SensorData {
  aX: number;
  aY: number;
  aZ: number;
  gX: number;
  gY: number;
  gZ: number;
}

export interface PredictionData {
  severity: number;
  label: string;
  confidence: number;
  recommendation: string;
  timestamp: string;
}

export interface LatestResponse {
  sensor: SensorData;
  prediction: PredictionData;
  wifi_ssid?: string;
}

const WINDOW = 120;
const API_URL = "https://tremor-ai-backend.onrender.com/latest";

const GRAVITY = 9.80665;

function convertSeverity(label: string, severity: number): Severity {
  switch (label.trim().toLowerCase()) {
    case "no tremor":
      return "NORMAL";
    case "mild tremor":
      return "MILD";
    case "severe tremor":
      return "SEVERE";
  }

  switch (severity) {
    case 1:
      return "MILD";
    case 2:
      return "SEVERE";
    default:
      return "NORMAL";
  }
}

function isLatestResponse(data: unknown): data is LatestResponse {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Partial<LatestResponse>;
  const sensor = candidate.sensor;
  const prediction = candidate.prediction;

  return Boolean(
    sensor &&
      typeof sensor.aX === "number" &&
      typeof sensor.aY === "number" &&
      typeof sensor.aZ === "number" &&
      typeof sensor.gX === "number" &&
      typeof sensor.gY === "number" &&
      typeof sensor.gZ === "number" &&
      prediction &&
      typeof prediction.severity === "number" &&
      typeof prediction.label === "string" &&
      typeof prediction.confidence === "number" &&
      typeof prediction.recommendation === "string" &&
      typeof prediction.timestamp === "string",
  );
}

function createEmptySnapshot(): BioSnapshot {
  return {
    waveform: [],
    spectrum: [],
    rms: [],
    frequency: null,
    amplitude: null,
    rmsCurrent: null,
    severity: "NORMAL",
    predictionLabel: null,
    severityScore: null,
    confidence: null,
    signalStrength: null,
    aiAccuracy: null,
    sensor: null,
    recommendation: "Waiting for sensor data.",
    timestamp: null,
    hasPrediction: false,
    connectionStatus: "checking",
    wifiSSID: null,
  };
}

export const BioSignalContext = createContext<BioSnapshot | null>(null);

export function useBioSignal(): BioSnapshot {
  const snapshot = useContext(BioSignalContext);
  if (!snapshot) {
    throw new Error("useBioSignal must be used within the application shell.");
  }
  return snapshot;
}

export function useBioSignalSource(): BioSnapshot {
  const [snap, setSnap] = useState<BioSnapshot>(createEmptySnapshot);

  useEffect(() => {
    let mounted = true;
    let sampleIndex = 0;
    let timeout: number | undefined;
    let controller: AbortController | undefined;

    const fetchLatest = async () => {
      controller = new AbortController();
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const responseData: unknown = await response.json();

        if (!mounted) return;

        let data: LatestResponse | null = null;
        if (isLatestResponse(responseData)) {
          data = responseData;
        } else {
          setSnap({
            ...createEmptySnapshot(),
            connectionStatus: "disconnected",
          });
        }

        if (!data) {
          return;
        }

        const backendSeverity = data.prediction.severity;
        const severity = convertSeverity(data.prediction.label, backendSeverity);
        const confidence = data.prediction.confidence;
        const sensor = data.sensor;

        sampleIndex += 1;

        const waveformValue = sensor.aX / GRAVITY;

        const amplitude =
          Math.sqrt(
            sensor.aX * sensor.aX +
              sensor.aY * sensor.aY +
              sensor.aZ * sensor.aZ,
          ) / GRAVITY;

        setSnap((previous) => {
          const waveform: WaveformPoint[] = [
            ...previous.waveform,
            {
              t: sampleIndex,
              v: waveformValue,
            },
          ].slice(-WINDOW);

          const recentWaveform = waveform.slice(-30);

          const rmsCurrent = Math.sqrt(
            recentWaveform.reduce(
              (sum, point) => sum + point.v * point.v,
              0,
            ) / recentWaveform.length,
          );

          const rms: RmsPoint[] = [
            ...previous.rms,
            {
              t: sampleIndex,
              rms: rmsCurrent,
            },
          ].slice(-40);

          return {
            ...previous,
            waveform,
            rms,

            // The current API returns individual sensor readings, not
            // a time-window/FFT result, so no frequency is invented here.
            frequency: null,

            amplitude: Number(amplitude.toFixed(3)),
            rmsCurrent: Number(rmsCurrent.toFixed(3)),

            severity,
            predictionLabel: data.prediction.label,
            severityScore: null,
            confidence,

            signalStrength: null,
            aiAccuracy: null,

            sensor,
            recommendation: data.prediction.recommendation,
            timestamp: data.prediction.timestamp,
            hasPrediction: true,
            connectionStatus: "connected",
            wifiSSID: data.wifi_ssid?.trim() || null,
          };
        });
      } catch (error) {
        if (!mounted || controller?.signal.aborted) return;
        console.error("Latest prediction API error:", error);

        setSnap((previous) => ({
          ...previous,
          connectionStatus: "disconnected",
        }));
      } finally {
        if (mounted) {
          timeout = window.setTimeout(() => {
            void fetchLatest();
          }, 1000);
        }
      }
    };

    void fetchLatest();

    return () => {
      mounted = false;
      if (timeout !== undefined) window.clearTimeout(timeout);
      controller?.abort();
    };
  }, []);

  return snap;
}

export const severityColor = (severity: Severity): string => {
  if (severity === "NORMAL") {
    return "var(--color-success)";
  }

  if (severity === "MILD") {
    return "var(--color-warning)";
  }

  return "var(--color-destructive)";
};
