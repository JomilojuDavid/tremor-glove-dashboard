import {
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineClock,
  HiOutlineHeart,
  HiOutlineCpuChip,
  HiOutlineSignal,
} from "react-icons/hi2";

export function PatientCard({
  sessionSeconds,
}: {
  sessionSeconds: number;
}) {
  const mm = String(Math.floor(sessionSeconds / 60)).padStart(2, "0");
  const ss = String(sessionSeconds % 60).padStart(2, "0");

  const items = [
    {
      icon: HiOutlineUser,
      label: "Patient",
      value: "Angel Chidiebere",
    },
    {
      icon: HiOutlineHeart,
      label: "Age",
      value: "24 yrs",
    },
    {
      icon: HiOutlineIdentification,
      label: "Device ID",
      value: "NS-AX-2041",
    },
    {
      icon: HiOutlineClock,
      label: "Session",
      value: `${mm}:${ss}`,
    },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Patient Information
          </div>

          <div className="mt-1 text-lg font-semibold">
            Active Session
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success ring-1 ring-success/30">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-ring" />
          Monitoring
        </span>
      </div>

      {/* Patient information */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-xl border border-border bg-background/30 p-3"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <it.icon className="h-3.5 w-3.5" />
              {it.label}
            </div>

            <div className="mt-1.5 text-sm font-semibold">
              {it.value}
            </div>
          </div>
        ))}
      </div>

      {/* System status */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-success/20 bg-success/5 p-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <HiOutlineSignal className="h-3.5 w-3.5" />
            System
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            Online
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/30 p-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <HiOutlineCpuChip className="h-3.5 w-3.5" />
            AI Model
          </div>

          <div className="mt-1.5 text-sm font-semibold">
            Random Forest
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/30 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Data Source
          </div>

          <div className="mt-1.5 text-sm font-semibold">
            Demo Simulation
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/30 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            API
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            Connected
          </div>
        </div>
      </div>
    </div>
  );
}