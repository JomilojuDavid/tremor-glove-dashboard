import { createFileRoute } from "@tanstack/react-router";
import { useBioSignal } from "@/hooks/use-biosignal";
import { WaveformChart, SpectrumChart, RmsChart } from "@/components/dashboard/Charts";
import { ClassificationCard } from "@/components/dashboard/ClassificationCard";
import { getHealth } from "@/services/api";
import { useEffect } from "react";

export const Route = createFileRoute("/live")({
  component: () => {
    const [latest, setLatest] = useState<LatestResponse | null>(null);

useEffect(() => {
  getHealth()
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
}, []);

return (
      <div className="space-y-4">
        <ClassificationCard severity={bio.severity} confidence={bio.confidence} />
        <div className="grid gap-4 xl:grid-cols-2">
          <WaveformChart data={bio.waveform} />
          <SpectrumChart data={bio.spectrum} />
        </div>
        <RmsChart data={bio.rms} />
      </div>
    );
  },
});
