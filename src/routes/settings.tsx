import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineUserCircle,
  HiOutlineBellAlert,
  HiOutlineCpuChip,
  HiOutlineSwatch,
  HiOutlineCheck,
} from "react-icons/hi2";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

type Settings = {
  clinicianName: string;
  clinicianEmail: string;
  organization: string;
  patientId: string;
  samplingHz: number;
  tremorThreshold: number;
  alertSound: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  accentColor: "blue" | "emerald" | "violet" | "amber";
};

const DEFAULTS: Settings = {
  clinicianName: "Dr. Rohan Mehta",
  clinicianEmail: "r.mehta@neurosense.ai",
  organization: "NeuroSense Research Lab",
  patientId: "PT-00421",
  samplingHz: 200,
  tremorThreshold: 4.5,
  alertSound: true,
  emailAlerts: true,
  smsAlerts: false,
  accentColor: "blue",
};

const KEY = "neurosense-settings";

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => { setS(load()); }, []);

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onReset = () => setS(DEFAULTS);

  return (
    <form onSubmit={onSave} className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">System Preferences</div>
          <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure clinician profile, device, alerts and appearance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onReset}
            className="rounded-xl border border-border bg-background/40 px-4 py-2 text-sm hover:bg-white/5">
            Reset
          </button>
          <button type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary">
            {saved ? <><HiOutlineCheck className="h-4 w-4" /> Saved</> : "Save Changes"}
          </button>
        </div>
      </header>

      <Section icon={<HiOutlineUserCircle className="h-5 w-5" />} title="Clinician Profile"
        subtitle="Identity used on reports and audit logs.">
        <Field label="Full name">
          <input value={s.clinicianName} onChange={(e) => update("clinicianName", e.target.value)} className={input} />
        </Field>
        <Field label="Email">
          <input type="email" value={s.clinicianEmail} onChange={(e) => update("clinicianEmail", e.target.value)} className={input} />
        </Field>
        <Field label="Organization">
          <input value={s.organization} onChange={(e) => update("organization", e.target.value)} className={input} />
        </Field>
        <Field label="Active Patient ID">
          <input value={s.patientId} onChange={(e) => update("patientId", e.target.value)} className={input} />
        </Field>
      </Section>

      <Section icon={<HiOutlineCpuChip className="h-5 w-5" />} title="Device & Signal"
        subtitle="Sampling and AI classification thresholds.">
        <Field label={`Sampling rate — ${s.samplingHz} Hz`}>
          <input type="range" min={50} max={1000} step={10} value={s.samplingHz}
            onChange={(e) => update("samplingHz", Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
        </Field>
        <Field label={`Tremor threshold — ${s.tremorThreshold.toFixed(1)} Hz`}>
          <input type="range" min={1} max={12} step={0.1} value={s.tremorThreshold}
            onChange={(e) => update("tremorThreshold", Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
        </Field>
      </Section>

      <Section icon={<HiOutlineBellAlert className="h-5 w-5" />} title="Alerts & Notifications"
        subtitle="Where critical events are routed.">
        <Toggle label="Sound alerts" hint="Play tone on severe tremor events"
          value={s.alertSound} onChange={(v) => update("alertSound", v)} />
        <Toggle label="Email alerts" hint="Send summary to clinician inbox"
          value={s.emailAlerts} onChange={(v) => update("emailAlerts", v)} />
        <Toggle label="SMS alerts" hint="Send urgent SMS for red-zone events"
          value={s.smsAlerts} onChange={(v) => update("smsAlerts", v)} />
      </Section>

      <Section icon={<HiOutlineSwatch className="h-5 w-5" />} title="Appearance"
        subtitle="Theme and accent color.">
        <Field label="Theme">
          <div className="flex gap-2">
            {(["dark", "light"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t)}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm capitalize transition-colors ${
                  theme === t ? "border-primary bg-primary/15 text-foreground" : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Accent">
          <div className="flex gap-2">
            {(["blue", "emerald", "violet", "amber"] as const).map((c) => {
              const dot = { blue: "#3b82f6", emerald: "#22c55e", violet: "#8b5cf6", amber: "#facc15" }[c];
              const active = s.accentColor === c;
              return (
                <button key={c} type="button" onClick={() => update("accentColor", c)}
                  className={`group relative h-10 w-10 rounded-xl border transition-all ${active ? "border-foreground scale-110" : "border-border hover:border-foreground/40"}`}
                  style={{ background: dot }} aria-label={c}>
                  {active && <HiOutlineCheck className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {saved && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-border bg-success/15 px-4 py-2.5 text-sm text-success glow-success">
          <HiOutlineCheck className="h-4 w-4" /> Settings saved
        </motion.div>
      )}
    </form>
  );
}

const input =
  "w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">{icon}</div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </motion.section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 px-4 py-3 text-left transition-colors hover:bg-white/5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${value ? "bg-primary glow-primary" : "bg-muted"}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
