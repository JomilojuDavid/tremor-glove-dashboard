import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlineBars3,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineWifi,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { TbBattery3 } from "react-icons/tb";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [now, setNow] = useState<Date | null>(null);
  const { theme, toggle } = useTheme();
  const [battery] = useState(82);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "DR";

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 glass border-b border-border">
      <div className="flex items-center gap-4 px-4 py-3 lg:px-8">
        <button
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/40 lg:hidden"
          aria-label="Menu"
        >
          <HiOutlineBars3 className="h-5 w-5" />
        </button>

        <div className="hidden md:block">
          <h1 className="text-lg font-semibold tracking-tight">NeuroSense AI</h1>
          <p className="text-xs text-muted-foreground">Real-Time Tremor Monitoring System</p>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="relative hidden md:block">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search patients, sessions…"
              className="h-10 w-56 rounded-xl border border-border bg-background/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 lg:w-72"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-xs">
            <span className="font-mono">{now ? now.toLocaleTimeString() : "--:--:--"}</span>
            <span className="text-muted-foreground">{now ? now.toLocaleDateString() : ""}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-xs">
            <HiOutlineWifi className="h-4 w-4 text-success" />
            <span className="hidden sm:inline">Connected</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-xs">
            <TbBattery3 className="h-4 w-4 text-success" />
            <span>{battery}%</span>
          </div>

          <button
            onClick={toggle}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/40 transition-colors hover:bg-white/5"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <HiOutlineMoon className="h-4 w-4" /> : <HiOutlineSun className="h-4 w-4" />}
          </button>

          <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/40 hover:bg-white/5">
            <HiOutlineBell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger pulse-ring text-danger" />
          </button>

          {user ? (
            <button
              onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}
              title={`Sign out (${user.email ?? "account"})`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-2 py-1.5 text-xs hover:bg-white/5"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-success font-semibold text-primary-foreground">{initials}</span>
              <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground glow-primary"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
