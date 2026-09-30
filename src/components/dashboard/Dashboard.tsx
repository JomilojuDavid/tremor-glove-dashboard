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
