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
      <PatientCard sessionSeconds={session} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClassificationCard severity={bio.severity} confidence={bio.confidence} />
        </div>
        <SeverityGauge score={bio.severityScore} severity={bio.severity} />
      </div>

      <MetricsGrid
        frequency={bio.frequency}
        amplitude={bio.amplitude}
        aiAccuracy={bio.aiAccuracy}
        monitoringMin={+(session / 60).toFixed(1)}
        signal={bio.signalStrength}
        totalReadings={bio.totalReadings}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <WaveformChart data={bio.waveform} />
        <SpectrumChart data={bio.spectrum} />
        <RmsChart data={bio.rms} />
      </div>

      <ActivityLog severity={bio.severity} />

      <ToastHost severity={bio.severity} />
    </div>
  );
}
