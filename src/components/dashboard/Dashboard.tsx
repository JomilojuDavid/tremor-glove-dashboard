import { useEffect, useState } from "react";
import { useBioSignal } from "@/hooks/use-biosignal";
import { PatientCard } from "./PatientCard";
import { ClassificationCard } from "./ClassificationCard";
import { WaveformChart, SpectrumChart, RmsChart } from "./Charts";
import { MetricsGrid } from "./MetricsGrid";
import { SeverityGauge } from "./SeverityGauge";
import { ActivityLog } from "./ActivityLog";
import { ToastHost } from "./ToastHost";

export function Dashboard() {
  const bio = useBioSignal();
  const [session, setSession] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSession((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      <PatientCard sessionSeconds={session} connectionStatus={bio.connectionStatus} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClassificationCard
            severity={bio.severity}
            confidence={bio.confidence}
            predictionLabel={bio.predictionLabel}
            recommendation={bio.recommendation}
            hasPrediction={bio.hasPrediction}
            connectionStatus={bio.connectionStatus}
          />
        </div>
        <SeverityGauge score={bio.severityScore} severity={bio.severity} hasPrediction={bio.hasPrediction} />
      </div>

      <MetricsGrid
        frequency={bio.frequency}
        amplitude={bio.amplitude}
        aiAccuracy={bio.aiAccuracy}
        monitoringMin={+(session / 60).toFixed(1)}
        signal={bio.signalStrength}
        totalReadings={null}
        connectionStatus={bio.connectionStatus}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Sensor Data</h2>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${
                bio.connectionStatus === "connected"
                  ? "bg-emerald-500"
                  : bio.connectionStatus === "disconnected"
                    ? "bg-destructive"
                    : "bg-muted-foreground"
              }`}
            />
            {bio.connectionStatus === "connected"
              ? "Live"
              : bio.connectionStatus === "disconnected"
                ? "Offline"
                : "Checking"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-4">
            <h3 className="mb-2 text-sm font-medium">Accelerometer</h3>
            <div className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-2 text-sm">
              <span className="text-muted-foreground">X</span>
              <span className="font-mono tabular-nums">
                {bio.sensor?.aX.toFixed(3) ?? "Waiting..."}
              </span>
              <span className="text-xs text-muted-foreground">m/s²</span>
            </div>
            <div className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-2 text-sm">
              <span className="text-muted-foreground">Y</span>
              <span className="font-mono tabular-nums">
                {bio.sensor?.aY.toFixed(3) ?? "Waiting..."}
              </span>
              <span className="text-xs text-muted-foreground">m/s²</span>
            </div>
            <div className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-2 text-sm">
              <span className="text-muted-foreground">Z</span>
              <span className="font-mono tabular-nums">
                {bio.sensor?.aZ.toFixed(3) ?? "Waiting..."}
              </span>
              <span className="text-xs text-muted-foreground">m/s²</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="mb-2 text-sm font-medium">Gyroscope</h3>
            <div className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-2 text-sm">
              <span className="text-muted-foreground">X</span>
              <span className="font-mono tabular-nums">
                {bio.sensor?.gX.toFixed(3) ?? "Waiting..."}
              </span>
              <span className="text-xs text-muted-foreground">°/s</span>
            </div>
            <div className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-2 text-sm">
              <span className="text-muted-foreground">Y</span>
              <span className="font-mono tabular-nums">
                {bio.sensor?.gY.toFixed(3) ?? "Waiting..."}
              </span>
              <span className="text-xs text-muted-foreground">°/s</span>
            </div>
            <div className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-2 text-sm">
              <span className="text-muted-foreground">Z</span>
              <span className="font-mono tabular-nums">
                {bio.sensor?.gZ.toFixed(3) ?? "Waiting..."}
              </span>
              <span className="text-xs text-muted-foreground">°/s</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <WaveformChart data={bio.waveform} connectionStatus={bio.connectionStatus} />
        <SpectrumChart data={bio.spectrum} connectionStatus={bio.connectionStatus} />
        <RmsChart data={bio.rms} connectionStatus={bio.connectionStatus} />
      </div>

      <ActivityLog
        severity={bio.severity}
        predictionLabel={bio.predictionLabel}
        timestamp={bio.timestamp}
        connectionStatus={bio.connectionStatus}
      />

      <ToastHost
        severity={bio.severity}
        recommendation={bio.recommendation}
        timestamp={bio.timestamp}
        connectionStatus={bio.connectionStatus}
      />
    </div>
  );
}
