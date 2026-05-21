import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  HiOutlineSquares2X2,
  HiOutlineSignal,
  HiOutlineCpuChip,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentChartBar,
  HiOutlineCog6Tooth,
  HiOutlineDevicePhoneMobile,
} from "react-icons/hi2";
import { TbActivityHeartbeat } from "react-icons/tb";

const items = [
  { to: "/", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { to: "/live", label: "Live Monitoring", icon: HiOutlineSignal },
  { to: "/ai", label: "AI Analysis", icon: HiOutlineCpuChip },
  { to: "/history", label: "Patient History", icon: HiOutlineClipboardDocumentList },
  { to: "/reports", label: "Reports", icon: HiOutlineDocumentChartBar },
  { to: "/settings", label: "Settings", icon: HiOutlineCog6Tooth },
  { to: "/device", label: "About Device", icon: HiOutlineDevicePhoneMobile },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 glass border-r border-border
          transition-transform duration-300 lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col p-5">
          <Link to="/" className="flex items-center gap-3 px-2 pb-6">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary glow-primary">
              <TbActivityHeartbeat className="h-6 w-6" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success pulse-ring text-success" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">NeuroSense AI</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Neuro Suite</div>
            </div>
          </Link>

          <nav className="mt-2 flex flex-1 flex-col gap-1">
            {items.map((it) => {
              const active = path === it.to;
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors
                    ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-primary/15 ring-1 ring-primary/40"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="relative z-10 h-5 w-5" />
                  <span className="relative z-10 font-medium">{it.label}</span>
                  {active && <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary glow-primary" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success pulse-ring text-success" />
              Device Online
            </div>
            <div className="mt-2 text-xs">Firmware <span className="text-foreground">v3.2.1</span></div>
            <div className="mt-1 text-xs">Uptime <span className="text-foreground">12h 04m</span></div>
          </div>
        </div>
      </aside>
    </>
  );
}
