import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiOutlineUserCircle,
  HiOutlineBellAlert,
  HiOutlineCpuChip,
  HiOutlineSwatch,
  HiOutlineCheck,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineCloud,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { setAccent, type AccentColor } from "@/hooks/use-accent";
import { getSettings, saveSettings, type SettingsData } from "@/lib/settings.functions";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const DEFAULTS: SettingsData = {
  clinicianName: "Dr. Rohan Mehta",
  clinicianEmail: "r.mehta@neurosense.ai",
  clinicianPhone: "+1 415 555 0142",
  licenseNumber: "MD-204918",
  organization: "NeuroSense Research Lab",
  department: "Movement Disorders",
  patientId: "PT-00421",
  patientName: "Anonymous Subject",
  patientAge: 62,
  patientSex: "male",
  deviceSerial: "NS-EMG-0042",
  firmware: "2.4.1",
  samplingHz: 200,
  tremorThreshold: 4.5,
  emgGain: 1000,
  filterLow: 20,
  filterHigh: 450,
  alertSound: true,
  emailAlerts: true,
  smsAlerts: false,
  alertEmail: "alerts@neurosense.ai",
  alertPhone: "+1 415 555 0199",
  severityFloor: "moderate",
  timezone: "UTC",
  language: "en",
  units: "metric",
  dateFormat: "iso",
  retentionDays: 90,
  anonymizeExports: true,
  shareTelemetry: false,
  reportHeader: "NeuroSense Clinical Report",
  reportFooter: "Confidential — for clinical use only.",
  autoReport: false,
  accentColor: "blue",
};

const LOCAL_KEY = "neurosense-settings";

function loadLocal(): SettingsData {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [s, setS] = useState<SettingsData>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useServerFn(getSettings);
  const persistSettings = useServerFn(saveSettings);

  const query = useQuery({
    queryKey: ["user-settings", user?.id ?? "anon"],
    queryFn: () => fetchSettings(),
    enabled: !!user,
  });

  // Hydrate state from remote (signed in) or local (signed out).
  useEffect(() => {
    if (user) {
      if (query.data) setS({ ...DEFAULTS, ...(query.data.data ?? {}) });
    } else {
      const local = loadLocal();
      setS(local);
      setAccent(local.accentColor as AccentColor);
    }
  }, [user, query.data]);

  const mutation = useMutation({
    mutationFn: (data: SettingsData) => persistSettings({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-settings"] });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    },
  });

  const update = <K extends keyof SettingsData>(k: K, v: SettingsData[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      mutation.mutate(s);
    } else {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); } catch {}
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    }
  };

  const onReset = () => setS(DEFAULTS);

  const syncing = user && (query.isLoading || mutation.isPending);

  return (
    <form onSubmit={onSave} className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">System Preferences</div>
          <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure clinician profile, patient, device, alerts, regional, privacy, reports and appearance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onReset}
            className="rounded-xl border border-border bg-background/40 px-4 py-2 text-sm hover:bg-white/5">
            Reset
          </button>
          <button type="submit" disabled={!!syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-60">
            {saved ? <><HiOutlineCheck className="h-4 w-4" /> Saved</> : mutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </header>

      {/* Sync status banner */}
      {authLoading ? null : user ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <HiOutlineCloud className="h-4 w-4 text-success" />
            <span>Synced to cloud as <span className="font-medium">{user.email ?? user.id}</span></span>
          </div>
          <button type="button" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-white/5">
            <HiOutlineArrowRightOnRectangle className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <HiOutlineCloud className="h-4 w-4 text-primary" />
            <span>Currently saving to this browser only. Sign in to sync across devices.</span>
          </div>
          <Link to="/auth" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground glow-primary">
            Sign in
          </Link>
        </div>
      )}

      {query.error && user && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Failed to load settings: {(query.error as Error).message}
        </div>
      )}

      <Section icon={<HiOutlineUserCircle className="h-5 w-5" />} title="Clinician Profile"
        subtitle="Identity used on reports and audit logs.">
        <Field label="Full name"><input value={s.clinicianName} onChange={(e) => update("clinicianName", e.target.value)} className={input} /></Field>
        <Field label="Email"><input type="email" value={s.clinicianEmail} onChange={(e) => update("clinicianEmail", e.target.value)} className={input} /></Field>
        <Field label="Phone"><input value={s.clinicianPhone} onChange={(e) => update("clinicianPhone", e.target.value)} className={input} /></Field>
        <Field label="License number"><input value={s.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} className={input} /></Field>
        <Field label="Organization"><input value={s.organization} onChange={(e) => update("organization", e.target.value)} className={input} /></Field>
        <Field label="Department"><input value={s.department} onChange={(e) => update("department", e.target.value)} className={input} /></Field>
      </Section>

      <Section icon={<HiOutlineClipboardDocumentList className="h-5 w-5" />} title="Active Patient"
        subtitle="Subject currently bound to this session.">
        <Field label="Patient ID"><input value={s.patientId} onChange={(e) => update("patientId", e.target.value)} className={input} /></Field>
        <Field label="Display name"><input value={s.patientName} onChange={(e) => update("patientName", e.target.value)} className={input} /></Field>
        <Field label="Age">
          <input type="number" min={0} max={120} value={s.patientAge}
            onChange={(e) => update("patientAge", Number(e.target.value))} className={input} />
        </Field>
        <Field label="Sex">
          <select value={s.patientSex} onChange={(e) => update("patientSex", e.target.value as SettingsData["patientSex"])} className={input}>
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
        </Field>
      </Section>

      <Section icon={<HiOutlineCpuChip className="h-5 w-5" />} title="Device & Signal"
        subtitle="Sampling, gain, filters and classification thresholds.">
        <Field label="Device serial"><input value={s.deviceSerial} onChange={(e) => update("deviceSerial", e.target.value)} className={input} /></Field>
        <Field label="Firmware"><input value={s.firmware} onChange={(e) => update("firmware", e.target.value)} className={input} /></Field>
        <Field label={`Sampling rate — ${s.samplingHz} Hz`}>
          <input type="range" min={50} max={1000} step={10} value={s.samplingHz}
            onChange={(e) => update("samplingHz", Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
        </Field>
        <Field label={`Tremor threshold — ${s.tremorThreshold.toFixed(1)} Hz`}>
          <input type="range" min={1} max={12} step={0.1} value={s.tremorThreshold}
            onChange={(e) => update("tremorThreshold", Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
        </Field>
        <Field label={`EMG gain — ${s.emgGain}×`}>
          <input type="range" min={100} max={5000} step={50} value={s.emgGain}
            onChange={(e) => update("emgGain", Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
        </Field>
        <Field label="Bandpass (Hz)">
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={100} value={s.filterLow}
              onChange={(e) => update("filterLow", Number(e.target.value))} className={input} />
            <span className="text-xs text-muted-foreground">to</span>
            <input type="number" min={100} max={1000} value={s.filterHigh}
              onChange={(e) => update("filterHigh", Number(e.target.value))} className={input} />
          </div>
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
        <Field label="Severity floor">
          <select value={s.severityFloor} onChange={(e) => update("severityFloor", e.target.value as SettingsData["severityFloor"])} className={input}>
            <option value="low">Low</option><option value="moderate">Moderate</option>
            <option value="high">High</option><option value="critical">Critical only</option>
          </select>
        </Field>
        <Field label="Alert email"><input type="email" value={s.alertEmail} onChange={(e) => update("alertEmail", e.target.value)} className={input} /></Field>
        <Field label="Alert phone"><input value={s.alertPhone} onChange={(e) => update("alertPhone", e.target.value)} className={input} /></Field>
      </Section>

      <Section icon={<HiOutlineGlobeAlt className="h-5 w-5" />} title="Regional & Format"
        subtitle="Locale, units and time display.">
        <Field label="Timezone">
          <select value={s.timezone} onChange={(e) => update("timezone", e.target.value)} className={input}>
            {["UTC","America/Los_Angeles","America/New_York","Europe/London","Europe/Berlin","Asia/Tokyo","Asia/Kolkata","Australia/Sydney"].map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </Field>
        <Field label="Language">
          <select value={s.language} onChange={(e) => update("language", e.target.value as SettingsData["language"])} className={input}>
            <option value="en">English</option><option value="es">Español</option>
            <option value="fr">Français</option><option value="de">Deutsch</option><option value="pt">Português</option>
          </select>
        </Field>
        <Field label="Units">
          <select value={s.units} onChange={(e) => update("units", e.target.value as SettingsData["units"])} className={input}>
            <option value="metric">Metric</option><option value="imperial">Imperial</option>
          </select>
        </Field>
        <Field label="Date format">
          <select value={s.dateFormat} onChange={(e) => update("dateFormat", e.target.value as SettingsData["dateFormat"])} className={input}>
            <option value="iso">2026-06-05 (ISO)</option>
            <option value="us">06/05/2026 (US)</option>
            <option value="eu">05/06/2026 (EU)</option>
          </select>
        </Field>
      </Section>

      <Section icon={<HiOutlineShieldCheck className="h-5 w-5" />} title="Privacy & Data"
        subtitle="Retention and what leaves the device.">
        <Field label={`Retention — ${s.retentionDays} days`}>
          <input type="range" min={7} max={365} step={1} value={s.retentionDays}
            onChange={(e) => update("retentionDays", Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
        </Field>
        <Toggle label="Anonymize exports" hint="Strip PII from CSV/PDF exports"
          value={s.anonymizeExports} onChange={(v) => update("anonymizeExports", v)} />
        <Toggle label="Share anonymous telemetry" hint="Help improve the AI model"
          value={s.shareTelemetry} onChange={(v) => update("shareTelemetry", v)} />
      </Section>

      <Section icon={<HiOutlineClipboardDocumentList className="h-5 w-5" />} title="Reports"
        subtitle="Default header/footer and automation.">
        <Field label="Report header"><input value={s.reportHeader} onChange={(e) => update("reportHeader", e.target.value)} className={input} /></Field>
        <Field label="Report footer"><input value={s.reportFooter} onChange={(e) => update("reportFooter", e.target.value)} className={input} /></Field>
        <Toggle label="Auto-generate weekly report" hint="Email a PDF every Monday 09:00"
          value={s.autoReport} onChange={(v) => update("autoReport", v)} />
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

      <div className="flex items-center justify-end gap-2 pb-4">
        <button type="button" onClick={onReset}
          className="rounded-xl border border-border bg-background/40 px-4 py-2 text-sm hover:bg-white/5">
          Reset to defaults
        </button>
        <button type="submit" disabled={!!syncing}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-60">
          {saved ? <><HiOutlineCheck className="h-4 w-4" /> Saved</> : mutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-border bg-success/15 px-4 py-2.5 text-sm text-success glow-success">
          <HiOutlineCheck className="h-4 w-4" /> Settings saved{user ? " to cloud" : " locally"}
        </motion.div>
      )}

      {mutation.isError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Save failed: {(mutation.error as Error).message}
        </div>
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
