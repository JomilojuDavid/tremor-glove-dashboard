import { HiOutlineUser, HiOutlineIdentification, HiOutlineClock, HiOutlineHeart } from "react-icons/hi2";

export function PatientCard({ sessionSeconds }: { sessionSeconds: number }) {
  const mm = String(Math.floor(sessionSeconds / 60)).padStart(2, "0");
  const ss = String(sessionSeconds % 60).padStart(2, "0");

  const items = [
    { icon: HiOutlineUser, label: "Patient", value: "Rohan Mehta" },
    { icon: HiOutlineHeart, label: "Age", value: "62 yrs" },
    { icon: HiOutlineIdentification, label: "Device ID", value: "NS-AX-2041" },
    { icon: HiOutlineClock, label: "Session", value: `${mm}:${ss}` },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Patient Information</div>
          <div className="mt-1 text-lg font-semibold">Active Session</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success ring-1 ring-success/30">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-ring text-success" />
          Monitoring
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl border border-border bg-background/30 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <it.icon className="h-3.5 w-3.5" />
              {it.label}
            </div>
            <div className="mt-1.5 text-sm font-semibold">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
