import { useEffect, useRef, useState } from "react";

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

export type Severity = "NORMAL" | "MILD" | "MODERATE" | "SEVERE";

export interface BioSnapshot {
  waveform: WaveformPoint[];
  spectrum: SpectrumPoint[];
  rms: RmsPoint[];
  frequency: number;
  amplitude: number;
  rmsCurrent: number;
  severity: Severity;
  severityScore: number;
  confidence: number;
  signalStrength: number;
  totalReadings: number;
  aiAccuracy: number;
}

interface PredictionResponse {
  sensor: {
    aX: number;
    aY: number;
    aZ: number;
    gX: number;
    gY: number;
    gZ: number;
  };
  prediction: {
    severity: number;
    label: string;
    confidence: number;
    recommendation: string;
    timestamp: string;
  };
}

const WINDOW = 120;

const API_URL = "https://tremor-ai-backend.onrender.com";

function convertSeverity(severity: number): Severity {
  switch (severity) {
    case 0:
      return "NORMAL";
    case 1:
      return "MILD";
    case 2:
      return "MODERATE";
    case 3:
      return "SEVERE";
    default:
      return "NORMAL";
  }
}

function severityToScore(severity: number): number {
  switch (severity) {
    case 0:
      return 12;
    case 1:
      return 37;
    case 2:
      return 62;
    case 3:
      return 87;
    default:
      return 12;
  }
}

export function useBioSignal(): BioSnapshot {
  const [snap, setSnap] = useState<BioSnapshot>(() => ({
    waveform: Array.from({ length: WINDOW }, (_, i) => ({
      t: i,
      v: 0,
    })),

    spectrum: Array.from({ length: 32 }, (_, i) => ({
      f: i,
      mag: 0,
    })),

    rms: Array.from({ length: 40 }, (_, i) => ({
      t: i,
      rms: 0.2,
    })),

    frequency: 5.2,
    amplitude: 0.4,
    rmsCurrent: 0.3,

    severity: "NORMAL",
    severityScore: 12,

    confidence: 0,
    signalStrength: 92,

    totalReadings: 0,

    aiAccuracy: 97.2,
  }));

  const tRef = useRef(0);
  const sensorRef = useRef({
    aX: 0,
    aY: 0,
    aZ: 9.81,
    gX: 0,
    gY: 0,
    gZ: 0,
  });

  useEffect(() => {
    let mounted = true;

    const generateSensorData = () => {
      const t = tRef.current;

      /*
       * Temporary sensor simulation.
       *
       * This will later be replaced by real ESP32
       * MPU6050 data.
       */

      const aX = Math.sin(t * 0.35) * 2.0 + (Math.random() - 0.5) * 0.5;
      const aY = Math.sin(t * 0.42) * 1.5 + (Math.random() - 0.5) * 0.4;
      const aZ = 9.81 + Math.sin(t * 0.25) * 0.8;

      const gX = Math.sin(t * 0.3) * 0.05;
      const gY = Math.sin(t * 0.4) * 0.05;
      const gZ = Math.sin(t * 0.5) * 0.05;

      sensorRef.current = {
        aX,
        aY,
        aZ,
        gX,
        gY,
        gZ,
      };

      return sensorRef.current;
    };

    const sendPrediction = async () => {
      const sensor = generateSensorData();

      try {
        const response = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sensor),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: PredictionResponse = await response.json();

        if (!mounted) return;

        const backendSeverity = data.prediction.severity;
        const severity = convertSeverity(backendSeverity);
        const severityScore = severityToScore(backendSeverity);

        tRef.current += 1;

        setSnap((prev) => {
          const amplitude =
            Math.sqrt(
              sensor.aX * sensor.aX +
              sensor.aY * sensor.aY +
              sensor.aZ * sensor.aZ,
            ) / 10;

          const frequency =
            4 +
            backendSeverity * 2 +
            Math.sin(tRef.current / 12) * 0.5;

          const next: WaveformPoint = {
            t: tRef.current,
            v:
              Math.sin(tRef.current * 0.35) * amplitude +
              Math.sin(tRef.current * 0.9) * amplitude * 0.4 +
              (Math.random() - 0.5) * amplitude * 0.3,
          };

          const waveform = [
            ...prev.waveform.slice(1),
            next,
          ];

          const spectrum = Array.from(
            { length: 32 },
            (_, i) => {
              const center = frequency;
              const distance = Math.abs(i - center);

              return {
                f: i,
                mag: Math.max(
                  0,
                  amplitude *
                    (1 / (1 + distance * 0.6)) +
                    Math.random() * 0.05,
                ),
              };
            },
          );

          const rmsCurrent = Math.sqrt(
            waveform
              .slice(-30)
              .reduce(
                (sum, point) => sum + point.v * point.v,
                0,
              ) / 30,
          );

          const rmsPoint: RmsPoint = {
            t: tRef.current,
            rms: rmsCurrent,
          };

          const rms = [
            ...prev.rms.slice(1),
            rmsPoint,
          ];

          return {
            waveform,
            spectrum,
            rms,

            frequency: +frequency.toFixed(2),

            amplitude: +amplitude.toFixed(2),

            rmsCurrent: +rmsCurrent.toFixed(3),

            severity,

            severityScore,

            confidence: data.prediction.confidence,

            signalStrength: 92,

            totalReadings: prev.totalReadings + 1,

            aiAccuracy: 97.2,
          };
        });
      } catch (error) {
        console.error("Prediction API error:", error);
      }
    };

    /*
     * Send sensor data to the AI backend every second.
     */
    const interval = setInterval(sendPrediction, 1000);

    /*
     * Send the first prediction immediately.
     */
    sendPrediction();

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return snap;
}

export const severityColor = (s: Severity) =>
  s === "NORMAL"
    ? "var(--color-success)"
    : s === "MILD"
      ? "var(--color-warning)"
      : s === "MODERATE"
        ? "oklch(0.72 0.17 55)"
        : "var(--color-destructive)";