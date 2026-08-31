import { createFileRoute } from "@tanstack/react-router";
import { useBioSignal } from "@/hooks/use-biosignal";
import { WaveformChart, SpectrumChart, RmsChart } from "@/components/dashboard/Charts";
import { ClassificationCard } from "@/components/dashboard/ClassificationCard";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/live")({
  component: LivePage,
  head: () => ({ meta: [{ title: "Live Monitoring — NeuroSense AI" }] }),
});

function LivePage() {
  const bio = useBioSignal();
  const [session, setSession] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking");

  useEffect(() => {
    const id = setInterval(() => setSession((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Simulate connection status check
    const timer = setTimeout(() => setConnectionStatus("connected"), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3">
        <div className="text-sm">
          <span className="font-medium">Device Connection: </span>
          <span className={`font-medium ${
            connectionStatus === "connected" ? "text-success" : 
            connectionStatus === "disconnected" ? "text-danger" : 
            "text-warning"
          }`}>
            {connectionStatus === "connected" ? "🟢 Connected" : 
             connectionStatus === "disconnected" ? "🔴 Disconnected" : 
             "🟡 Checking..."}
          </span>
        </div>
      </div>

      <ClassificationCard severity={bio.severity} confidence={bio.confidence} />
      
      <MetricsGrid
        frequency={bio.frequency}
        amplitude={bio.amplitude}
        aiAccuracy={bio.aiAccuracy}
        monitoringMin={+(session / 60).toFixed(1)}
        signal={bio.signalStrength}
        totalReadings={bio.totalReadings}
      />
      
      <div className="grid gap-4 xl:grid-cols-2">
        <WaveformChart data={bio.waveform} />
        <SpectrumChart data={bio.spectrum} />
      </div>
      <RmsChart data={bio.rms} />
    </div>
  );
}
