import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}

export function PagePlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{subtitle}</div>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        This module is part of the NeuroSense AI suite — telemetry feeds, AI inference logs and clinical reports stream here in production.
      </p>
    </div>
  );
}
