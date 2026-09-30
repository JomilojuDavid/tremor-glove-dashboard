import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiOutlineUser,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineCalendarDays,
  HiOutlineIdentification,
  HiOutlineChartBar,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineArchiveBoxArrowDown,
  HiOutlineArrowUturnLeft,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { useAuth } from "@/hooks/use-auth";
import {
  listPatients,
  upsertPatient,
  deletePatient,
  listSessions,
  upsertSession,
  deleteSession,
  type PatientInput,
  type PatientRow,
  type SessionInput,
  type SessionRow,
} from "@/lib/patients.functions";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "Patient History — NeuroSense AI" }] }),
});

const SEVERITY_TONE: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  moderate: "bg-warning/15 text-warning border-warning/30",
  high: "bg-danger/15 text-danger border-danger/30",
  critical: "bg-danger/25 text-danger border-danger/50",
};

const pillSelect =
  "rounded-xl border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
const btn =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs hover:bg-white/5";
const fieldCls =
  "w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function emptyPatient(): PatientInput {
  return {
    full_name: "",
    mrn: "",
    date_of_birth: "",
    sex: "unspecified",
    condition: "",
    handedness: "right",
    contact_email: "",
    contact_phone: "",
    notes: "",
    status: "active",
  };
}

function emptySession(patient_id: string): SessionInput {
  return {
    patient_id,
    started_at: new Date().toISOString().slice(0, 16),
    duration_minutes: 30,
    avg_tremor_hz: 4.2,
    peak_tremor_hz: 6.5,
    emg_rms: 0.32,
    episode_count: 2,
    severity: "moderate",
    device_id: "NS-AX-2041",
    notes: "",
  };
}

function ageFromDob(dob?: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(+d)) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function HistoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchPatients = useServerFn(listPatients);
  const savePatient = useServerFn(upsertPatient);
  const removePatient = useServerFn(deletePatient);

  const patientsQ = useQuery({
    queryKey: ["patients"],
    queryFn: () => fetchPatients(),
    enabled: !!user,
  });

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<PatientInput | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PatientRow | null>(null);

  const rows = patientsQ.data?.rows ?? [];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        r.full_name.toLowerCase().includes(needle) ||
        (r.mrn ?? "").toLowerCase().includes(needle) ||
        (r.condition ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, statusFilter]);

  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const saveMut = useMutation({
    mutationFn: (data: PatientInput) => savePatient({ data }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setEditing(null);
      if (res?.row?.id) setSelectedId(res.row.id);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => removePatient({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setSelectedId(null);
      setConfirmDelete(null);
    },
  });

  const onExportCsv = () => {
    const cols = ["id", "mrn", "full_name", "date_of_birth", "sex", "condition", "status", "created_at"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(",")]
      .concat(filtered.map((r) => cols.map((c) => esc((r as any)[c])).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-2xl p-10 text-center">
          <HiOutlineShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-xl font-semibold">Sign in to access patient history</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patient records are private to each clinician and require authentication.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const activeCount = rows.filter((r) => r.status === "active").length;
  const archivedCount = rows.length - activeCount;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Patient History</div>
          <h1 className="mt-1 text-2xl font-semibold">Longitudinal Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track patients over time with session metrics, severity trends and clinical notes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onExportCsv} className={btn + " text-sm"}>
            <HiOutlineArrowDownTray className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => setEditing(emptyPatient())}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground glow-primary"
          >
            <HiOutlinePlus className="h-4 w-4" /> New patient
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total patients" value={rows.length} />
        <StatCard label="Active" value={activeCount} tone="text-success" />
        <StatCard label="Archived" value={archivedCount} tone="text-muted-foreground" />
        <StatCard
          label="New this month"
          value={rows.filter((r) => new Date(r.created_at).getMonth() === new Date().getMonth() && new Date(r.created_at).getFullYear() === new Date().getFullYear()).length}
          tone="text-primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/40 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name, MRN, or condition…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/40 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="h-4 w-4 text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className={pillSelect}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {rows.length}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <aside className="glass max-h-[72vh] overflow-y-auto rounded-2xl p-2">
          {patientsQ.isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading patients…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <HiOutlineUser className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No patients match your filters.</p>
              <button
                onClick={() => setEditing(emptyPatient())}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground glow-primary"
              >
                <HiOutlinePlus className="h-3.5 w-3.5" /> Add a patient
              </button>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((p) => {
                const active = (selected?.id ?? "") === p.id;
                const age = ageFromDob(p.date_of_birth);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        active ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary text-sm font-semibold">
                          {p.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{p.full_name}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {p.mrn || "No MRN"}
                            {age != null ? ` · ${age} yrs` : ""}
                            {p.sex && p.sex !== "unspecified" ? ` · ${p.sex[0].toUpperCase()}` : ""}
                          </div>
                        </div>
                        {p.status === "archived" && (
                          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            Archived
                          </span>
                        )}
                      </div>
                      {p.condition && (
                        <div className="mt-2 truncate text-[11px] text-muted-foreground">{p.condition}</div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="glass rounded-2xl p-6">
          {selected ? (
            <PatientDetail
              patient={selected}
              onEdit={() => setEditing(selected as PatientInput)}
              onDelete={() => setConfirmDelete(selected)}
              onToggleArchive={() =>
                saveMut.mutate({
                  ...(selected as PatientInput),
                  status: selected.status === "archived" ? "active" : "archived",
                })
              }
              busy={saveMut.isPending}
            />
          ) : (
            <div className="grid place-items-center py-16 text-center text-muted-foreground">
              <HiOutlineClipboardDocumentList className="h-10 w-10" />
              <p className="mt-2 text-sm">Select a patient to see their longitudinal history.</p>
            </div>
          )}
        </section>
      </div>

      {patientsQ.error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Failed to load patients: {(patientsQ.error as Error).message}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <PatientEditor
            initial={editing}
            saving={saveMut.isPending}
            error={saveMut.error as Error | null}
            onClose={() => setEditing(null)}
            onSave={(data) => saveMut.mutate(data)}
          />
        )}
        {confirmDelete && (
          <ConfirmDialog
            title={`Delete ${confirmDelete.full_name}?`}
            body="This will permanently remove the patient and all associated sessions. This cannot be undone."
            confirmLabel="Delete patient"
            busy={delMut.isPending}
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => confirmDelete.id && delMut.mutate(confirmDelete.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function PatientDetail({
  patient,
  onEdit,
  onDelete,
  onToggleArchive,
  busy,
}: {
  patient: PatientRow;
  onEdit: () => void;
  onDelete: () => void;
  onToggleArchive: () => void;
  busy: boolean;
}) {
  const qc = useQueryClient();
  const fetchSessions = useServerFn(listSessions);
  const saveSession = useServerFn(upsertSession);
  const removeSession = useServerFn(deleteSession);

  const sessionsQ = useQuery({
    queryKey: ["patient-sessions", patient.id],
    queryFn: () => fetchSessions({ data: { patient_id: patient.id } }),
  });

  const [editingSession, setEditingSession] = useState<SessionInput | null>(null);
  const [confirmDelSession, setConfirmDelSession] = useState<SessionRow | null>(null);

  const saveMut = useMutation({
    mutationFn: (data: SessionInput) => saveSession({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-sessions", patient.id] });
      setEditingSession(null);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => removeSession({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-sessions", patient.id] });
      setConfirmDelSession(null);
    },
  });

  const sessions = sessionsQ.data?.rows ?? [];
  const totals = useMemo(() => {
    if (sessions.length === 0) return null;
    const num = (vs: (number | null | undefined)[]) => vs.filter((v): v is number => typeof v === "number");
    const avg = (vs: number[]) => (vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0);
    return {
      count: sessions.length,
      avgTremor: avg(num(sessions.map((s) => s.avg_tremor_hz))),
      peakTremor: Math.max(0, ...num(sessions.map((s) => s.peak_tremor_hz))),
      totalMinutes: num(sessions.map((s) => s.duration_minutes)).reduce((a, b) => a + b, 0),
      totalEpisodes: num(sessions.map((s) => s.episode_count)).reduce((a, b) => a + b, 0),
      lastVisit: sessions[0]?.started_at,
    };
  }, [sessions]);

  const age = ageFromDob(patient.date_of_birth);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary text-lg font-semibold">
            {patient.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{patient.full_name}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {patient.mrn && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineIdentification className="h-3.5 w-3.5" /> {patient.mrn}
                </span>
              )}
              {age != null && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineCalendarDays className="h-3.5 w-3.5" /> {age} yrs
                </span>
              )}
              {patient.sex && patient.sex !== "unspecified" && <span className="capitalize">{patient.sex}</span>}
              {patient.handedness && <span className="capitalize">{patient.handedness}-handed</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onEdit} className={btn}>
            <HiOutlinePencilSquare className="h-4 w-4" /> Edit
          </button>
          <button onClick={onToggleArchive} disabled={busy} className={btn}>
            {patient.status === "archived" ? (
              <>
                <HiOutlineArrowUturnLeft className="h-4 w-4" /> Restore
              </>
            ) : (
              <>
                <HiOutlineArchiveBoxArrowDown className="h-4 w-4" /> Archive
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger hover:bg-danger/15 disabled:opacity-50"
          >
            <HiOutlineTrash className="h-4 w-4" /> Delete
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Condition" value={patient.condition || "—"} />
        <Meta
          label="Contact"
          value={
            <div className="space-y-0.5">
              {patient.contact_email && (
                <div className="inline-flex items-center gap-1 text-xs">
                  <HiOutlineEnvelope className="h-3.5 w-3.5" /> {patient.contact_email}
                </div>
              )}
              {patient.contact_phone && (
                <div className="inline-flex items-center gap-1 text-xs">
                  <HiOutlinePhone className="h-3.5 w-3.5" /> {patient.contact_phone}
                </div>
              )}
              {!patient.contact_email && !patient.contact_phone && <span>—</span>}
            </div>
          }
        />
        <Meta label="Last visit" value={totals?.lastVisit ? new Date(totals.lastVisit).toLocaleDateString() : "—"} />
        <Meta label="Total sessions" value={String(totals?.count ?? 0)} />
      </section>

      {patient.notes && (
        <section className="rounded-xl border border-border bg-background/40 p-4">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Clinical notes</div>
          <p className="whitespace-pre-wrap text-sm">{patient.notes}</p>
        </section>
      )}

      <section className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <HiOutlineChartBar className="h-4 w-4" /> Aggregate metrics
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Avg tremor" value={totals ? `${totals.avgTremor.toFixed(1)} Hz` : "—"} />
          <Metric label="Peak tremor" value={totals ? `${totals.peakTremor.toFixed(1)} Hz` : "—"} />
          <Metric label="Total monitoring" value={totals ? `${Math.round(totals.totalMinutes)} min` : "—"} />
          <Metric label="Episodes" value={totals ? String(totals.totalEpisodes) : "—"} />
        </div>
        {sessions.length >= 2 && <TrendSparkline sessions={sessions} />}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Session timeline</h3>
          <button
            onClick={() => setEditingSession(emptySession(patient.id))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground glow-primary"
          >
            <HiOutlinePlus className="h-3.5 w-3.5" /> Add session
          </button>
        </div>
        {sessionsQ.isLoading ? (
          <div className="rounded-xl border border-border bg-background/30 p-6 text-sm text-muted-foreground">
            Loading sessions…
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No sessions logged yet. Add the first one to start tracking trends.
          </div>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-4">
            {sessions.map((s) => (
              <li key={s.id} className="relative">
                <span className="absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(s.started_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {s.duration_minutes ?? "—"} min
                        {s.device_id ? ` · ${s.device_id}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.severity && (
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider capitalize ${SEVERITY_TONE[s.severity]}`}>
                          {s.severity}
                        </span>
                      )}
                      <button
                        onClick={() => setEditingSession(s as SessionInput)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        title="Edit session"
                      >
                        <HiOutlinePencilSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelSession(s)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-danger/15 hover:text-danger"
                        title="Delete session"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Mini label="Avg" value={s.avg_tremor_hz != null ? `${s.avg_tremor_hz} Hz` : "—"} />
                    <Mini label="Peak" value={s.peak_tremor_hz != null ? `${s.peak_tremor_hz} Hz` : "—"} />
                    <Mini label="EMG RMS" value={s.emg_rms != null ? `${s.emg_rms}` : "—"} />
                    <Mini label="Episodes" value={s.episode_count != null ? `${s.episode_count}` : "—"} />
                  </div>
                  {s.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{s.notes}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <AnimatePresence>
        {editingSession && (
          <SessionEditor
            initial={editingSession}
            saving={saveMut.isPending}
            error={saveMut.error as Error | null}
            onClose={() => setEditingSession(null)}
            onSave={(d) => saveMut.mutate(d)}
          />
        )}
        {confirmDelSession && (
          <ConfirmDialog
            title="Delete session?"
            body="The session will be permanently removed from this patient's history."
            confirmLabel="Delete session"
            busy={delMut.isPending}
            onCancel={() => setConfirmDelSession(null)}
            onConfirm={() => confirmDelSession.id && delMut.mutate(confirmDelSession.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TrendSparkline({ sessions }: { sessions: SessionRow[] }) {
  const points = [...sessions]
    .reverse()
    .map((s) => s.avg_tremor_hz)
    .filter((v): v is number => typeof v === "number");
  if (points.length < 2) return null;
  const w = 600;
  const h = 60;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Tremor trend (avg Hz)</span>
        <span>
          {min.toFixed(1)} – {max.toFixed(1)} Hz
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} className="text-primary" />
      </svg>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/30 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}

function ModalShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function PatientEditor({
  initial,
  saving,
  error,
  onClose,
  onSave,
}: {
  initial: PatientInput;
  saving: boolean;
  error: Error | null;
  onClose: () => void;
  onSave: (data: PatientInput) => void;
}) {
  const [form, setForm] = useState<PatientInput>(initial);
  const set = <K extends keyof PatientInput>(k: K, v: PatientInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial.id;

  return (
    <ModalShell onClose={onClose} title={isEdit ? "Edit patient" : "New patient"}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name *">
            <input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Medical record number">
            <input value={form.mrn ?? ""} onChange={(e) => set("mrn", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              value={form.date_of_birth ?? ""}
              onChange={(e) => set("date_of_birth", e.target.value)}
              className={fieldCls}
            />
          </Field>
          <Field label="Sex">
            <select value={form.sex ?? "unspecified"} onChange={(e) => set("sex", e.target.value as any)} className={fieldCls}>
              <option value="unspecified">Unspecified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Primary condition">
            <input value={form.condition ?? ""} onChange={(e) => set("condition", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Handedness">
            <select
              value={form.handedness ?? "right"}
              onChange={(e) => set("handedness", e.target.value as any)}
              className={fieldCls}
            >
              <option value="right">Right</option>
              <option value="left">Left</option>
              <option value="ambidextrous">Ambidextrous</option>
            </select>
          </Field>
          <Field label="Contact email">
            <input
              type="email"
              value={form.contact_email ?? ""}
              onChange={(e) => set("contact_email", e.target.value)}
              className={fieldCls}
            />
          </Field>
          <Field label="Contact phone">
            <input value={form.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} className={fieldCls} />
          </Field>
        </div>
        <Field label="Clinical notes">
          <textarea
            rows={4}
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            className={fieldCls}
            placeholder="Diagnosis context, medications, observations…"
          />
        </Field>

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error.message}</div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={btn}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create patient"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function SessionEditor({
  initial,
  saving,
  error,
  onClose,
  onSave,
}: {
  initial: SessionInput;
  saving: boolean;
  error: Error | null;
  onClose: () => void;
  onSave: (data: SessionInput) => void;
}) {
  const [form, setForm] = useState<SessionInput>(initial);
  const set = <K extends keyof SessionInput>(k: K, v: SessionInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial.id;
  const num = (v: string) => (v === "" ? null : Number(v));

  return (
    <ModalShell onClose={onClose} title={isEdit ? "Edit session" : "New session"}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...form,
            started_at: new Date(form.started_at).toISOString(),
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Started at *">
            <input
              type="datetime-local"
              required
              value={form.started_at.slice(0, 16)}
              onChange={(e) => set("started_at", e.target.value)}
              className={fieldCls}
            />
          </Field>
          <Field label="Duration (minutes)">
            <input
              type="number"
              min={0}
              step="0.1"
              value={form.duration_minutes ?? ""}
              onChange={(e) => set("duration_minutes", num(e.target.value))}
              className={fieldCls}
            />
          </Field>
          <Field label="Avg tremor (Hz)">
            <input
              type="number"
              min={0}
              step="0.1"
              value={form.avg_tremor_hz ?? ""}
              onChange={(e) => set("avg_tremor_hz", num(e.target.value))}
              className={fieldCls}
            />
          </Field>
          <Field label="Peak tremor (Hz)">
            <input
              type="number"
              min={0}
              step="0.1"
              value={form.peak_tremor_hz ?? ""}
              onChange={(e) => set("peak_tremor_hz", num(e.target.value))}
              className={fieldCls}
            />
          </Field>
          <Field label="EMG RMS">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.emg_rms ?? ""}
              onChange={(e) => set("emg_rms", num(e.target.value))}
              className={fieldCls}
            />
          </Field>
          <Field label="Episode count">
            <input
              type="number"
              min={0}
              step="1"
              value={form.episode_count ?? ""}
              onChange={(e) => set("episode_count", num(e.target.value) as any)}
              className={fieldCls}
            />
          </Field>
          <Field label="Severity">
            <select
              value={form.severity ?? "moderate"}
              onChange={(e) => set("severity", e.target.value as any)}
              className={fieldCls}
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Device ID">
            <input value={form.device_id ?? ""} onChange={(e) => set("device_id", e.target.value)} className={fieldCls} />
          </Field>
        </div>
        <Field label="Session notes">
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            className={fieldCls}
          />
        </Field>

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error.message}</div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={btn}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add session"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell onClose={onCancel} title={title}>
      <p className="text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button onClick={onCancel} className={btn}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 disabled:opacity-50"
        >
          <HiOutlineTrash className="h-4 w-4" /> {busy ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
