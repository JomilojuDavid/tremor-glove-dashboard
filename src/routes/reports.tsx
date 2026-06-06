import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowDownTray,
  HiOutlinePrinter,
  HiOutlineCheckBadge,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineXMark,
  HiOutlineCloud,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { useAuth } from "@/hooks/use-auth";
import {
  listReports,
  upsertReport,
  deleteReport,
  type ReportInput,
  type ReportRow,
} from "@/lib/reports.functions";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Clinical Reports — NeuroSense AI" }] }),
});

const TYPE_LABELS: Record<string, string> = {
  session: "Session Summary",
  weekly: "Weekly Trend",
  incident: "Incident Report",
  longitudinal: "Longitudinal Review",
};

const SEVERITY_TONE: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  moderate: "bg-warning/15 text-warning border-warning/30",
  high: "bg-danger/15 text-danger border-danger/30",
  critical: "bg-danger/25 text-danger border-danger/50",
};

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  final: "bg-primary/15 text-primary border-primary/30",
  signed: "bg-success/15 text-success border-success/30",
};

function emptyDraft(): ReportInput {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  return {
    title: "Session Summary — " + now.toLocaleDateString(),
    report_type: "session",
    status: "draft",
    patient_id: "",
    patient_name: "",
    period_start: weekAgo.toISOString().slice(0, 16),
    period_end: now.toISOString().slice(0, 16),
    severity: "moderate",
    summary: "",
    findings: "",
    recommendations: "",
    metrics: { avgTremorHz: 4.2, peakTremorHz: 6.8, emgRms: 0.34, episodeCount: 3, sessionMinutes: 45 },
  };
}

function ReportsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchAll = useServerFn(listReports);
  const save = useServerFn(upsertReport);
  const remove = useServerFn(deleteReport);

  const query = useQuery({
    queryKey: ["clinical-reports"],
    queryFn: () => fetchAll(),
    enabled: !!user,
  });

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ReportInput | null>(null);

  const rows = query.data?.rows ?? [];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (typeFilter !== "all" && r.report_type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        r.title.toLowerCase().includes(needle) ||
        (r.patient_name ?? "").toLowerCase().includes(needle) ||
        (r.patient_id ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, typeFilter, statusFilter]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  const saveMut = useMutation({
    mutationFn: (data: ReportInput) => save({ data }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["clinical-reports"] });
      setEditing(null);
      if (res?.row?.id) setSelectedId(res.row.id);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinical-reports"] });
      setSelectedId(null);
    },
  });

  const onPrint = () => window.print();

  const onExportCsv = () => {
    const cols = [
      "id","title","report_type","status","patient_id","patient_name",
      "period_start","period_end","severity","signed_by","signed_at","created_at",
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(",")]
      .concat(filtered.map((r) => cols.map((c) => esc((r as any)[c])).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `clinical-reports-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const onSign = (r: ReportRow) => {
    const signed_by = user?.email ?? "Clinician";
    const payload: ReportInput = {
      ...(r as ReportInput),
      status: "signed",
      signed_by,
      signed_at: new Date().toISOString(),
    };
    saveMut.mutate(payload);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-2xl p-10 text-center">
          <HiOutlineShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-xl font-semibold">Sign in to access clinical reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reports are stored securely per clinician and require authentication.
          </p>
          <Link to="/auth" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 print:space-y-0">
      <header className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Clinical Reports</div>
          <h1 className="mt-1 text-2xl font-semibold">Exports & Summaries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate, review, sign and export tremor monitoring reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm hover:bg-white/5">
            <HiOutlineArrowDownTray className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => { setEditing(emptyDraft()); }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground glow-primary">
            <HiOutlinePlus className="h-4 w-4" /> New report
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/40 p-3 print:hidden">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by title, patient or ID…"
            value={q} onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/40 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="h-4 w-4 text-muted-foreground" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={pillSelect}>
            <option value="all">All types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={pillSelect}>
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="final">Final</option>
            <option value="signed">Signed</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <HiOutlineCloud className="h-4 w-4 text-success" />
          {filtered.length} of {rows.length} report{rows.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr] print:grid-cols-1">
        {/* List */}
        <aside className="glass max-h-[70vh] overflow-y-auto rounded-2xl p-2 print:hidden">
          {query.isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading reports…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <HiOutlineDocumentText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No reports match your filters.</p>
              <button onClick={() => setEditing(emptyDraft())}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground glow-primary">
                <HiOutlinePlus className="h-3.5 w-3.5" /> Create the first one
              </button>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((r) => {
                const active = (selected?.id ?? "") === r.id;
                return (
                  <li key={r.id}>
                    <button onClick={() => setSelectedId(r.id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        active ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:bg-white/5"
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{r.title}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {r.patient_name || "Unassigned"}{r.patient_id ? ` · ${r.patient_id}` : ""}
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_TONE[r.status]}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-md border border-border px-1.5 py-0.5">{TYPE_LABELS[r.report_type]}</span>
                        {r.severity && (
                          <span className={`rounded-md border px-1.5 py-0.5 capitalize ${SEVERITY_TONE[r.severity]}`}>{r.severity}</span>
                        )}
                        <span className="ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Preview */}
        <section id="report-preview" className="glass rounded-2xl p-6 print:rounded-none print:bg-white print:p-0 print:text-black">
          {selected ? (
            <ReportPreview
              row={selected}
              onEdit={() => setEditing(selected as ReportInput)}
              onDelete={() => selected.id && delMut.mutate(selected.id)}
              onSign={() => onSign(selected)}
              onPrint={onPrint}
              busy={delMut.isPending || saveMut.isPending}
            />
          ) : (
            <div className="grid place-items-center py-16 text-center text-muted-foreground">
              <HiOutlineDocumentText className="h-10 w-10" />
              <p className="mt-2 text-sm">Select a report to preview, or create a new one.</p>
            </div>
          )}
        </section>
      </div>

      {query.error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Failed to load reports: {(query.error as Error).message}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <ReportEditor
            initial={editing}
            saving={saveMut.isPending}
            error={saveMut.error as Error | null}
            onClose={() => setEditing(null)}
            onSave={(data) => saveMut.mutate(data)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          body { background: white !important; }
          header, aside, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function ReportPreview({
  row, onEdit, onDelete, onSign, onPrint, busy,
}: {
  row: ReportRow;
  onEdit: () => void; onDelete: () => void; onSign: () => void; onPrint: () => void; busy: boolean;
}) {
  const m = row.metrics ?? {};
  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground print:text-black">
            <HiOutlineClipboardDocumentList className="h-3.5 w-3.5" /> NeuroSense Clinical Report
            <span className={`rounded-full border px-2 py-0.5 ${STATUS_TONE[row.status]} print:hidden`}>{row.status}</span>
          </div>
          <h2 className="mt-1 text-xl font-semibold">{row.title}</h2>
          <div className="mt-1 text-xs text-muted-foreground print:text-black">
            {TYPE_LABELS[row.report_type]} · Generated {new Date(row.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button onClick={onPrint} className={btn}><HiOutlinePrinter className="h-4 w-4" /> Print / PDF</button>
          <button onClick={onEdit} className={btn}><HiOutlinePencilSquare className="h-4 w-4" /> Edit</button>
          {row.status !== "signed" && (
            <button onClick={onSign} disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground glow-primary disabled:opacity-50">
              <HiOutlineCheckBadge className="h-4 w-4" /> Sign & lock
            </button>
          )}
          <button onClick={onDelete} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger hover:bg-danger/15 disabled:opacity-50">
            <HiOutlineTrash className="h-4 w-4" /> Delete
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Patient" value={row.patient_name || "—"} sub={row.patient_id || undefined} />
        <Meta label="Period"
          value={row.period_start ? new Date(row.period_start).toLocaleDateString() : "—"}
          sub={row.period_end ? "→ " + new Date(row.period_end).toLocaleDateString() : undefined} />
        <Meta label="Severity" value={<span className={`inline-block rounded-md border px-2 py-0.5 text-xs capitalize ${row.severity ? SEVERITY_TONE[row.severity] : "border-border"}`}>{row.severity ?? "—"}</span>} />
        <Meta label="Status" value={<span className={`inline-block rounded-md border px-2 py-0.5 text-xs uppercase ${STATUS_TONE[row.status]}`}>{row.status}</span>}
          sub={row.signed_at ? `Signed ${new Date(row.signed_at).toLocaleDateString()}` : undefined} />
      </section>

      <section className="rounded-xl border border-border p-4 print:border-black">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground print:text-black">
          <HiOutlineChartBar className="h-4 w-4" /> Key metrics
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Metric label="Avg tremor" value={m.avgTremorHz != null ? `${m.avgTremorHz} Hz` : "—"} />
          <Metric label="Peak tremor" value={m.peakTremorHz != null ? `${m.peakTremorHz} Hz` : "—"} />
          <Metric label="EMG RMS" value={m.emgRms != null ? `${m.emgRms}` : "—"} />
          <Metric label="Episodes" value={m.episodeCount != null ? `${m.episodeCount}` : "—"} />
          <Metric label="Duration" value={m.sessionMinutes != null ? `${m.sessionMinutes} min` : "—"} />
        </div>
      </section>

      <Block title="Clinical summary" body={row.summary} />
      <Block title="Findings" body={row.findings} />
      <Block title="Recommendations" body={row.recommendations} />

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground print:text-black">
        {row.signed_at ? (
          <div>Signed by <span className="font-medium">{row.signed_by}</span> on {new Date(row.signed_at).toLocaleString()}</div>
        ) : (
          <div>Unsigned draft — values may change before final sign-off.</div>
        )}
        <div className="mt-1">Report ID: <span className="font-mono">{row.id}</span></div>
      </footer>
    </article>
  );
}

function Meta({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3 print:bg-white">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground print:text-black">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground print:text-black">{sub}</div>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3 print:bg-white">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground print:text-black">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Block({ title, body }: { title: string; body?: string | null }) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground print:text-black">
        {body?.trim() ? body : <span className="italic">No content provided.</span>}
      </p>
    </section>
  );
}

function ReportEditor({
  initial, saving, error, onClose, onSave,
}: {
  initial: ReportInput; saving: boolean; error: Error | null;
  onClose: () => void; onSave: (data: ReportInput) => void;
}) {
  const [d, setD] = useState<ReportInput>(initial);
  const set = <K extends keyof ReportInput>(k: K, v: ReportInput[K]) => setD((p) => ({ ...p, [k]: v }));
  const setMetric = (k: keyof NonNullable<ReportInput["metrics"]>, v: number | null) =>
    setD((p) => ({ ...p, metrics: { ...(p.metrics ?? {}), [k]: v } }));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        className="glass max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6"
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{initial.id ? "Edit report" : "New report"}</div>
            <h2 className="mt-1 text-lg font-semibold">{d.title || "Untitled"}</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/40 hover:bg-white/5">
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </header>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(d); }}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <Field label="Title" full>
            <input required value={d.title} onChange={(e) => set("title", e.target.value)} className={input} />
          </Field>
          <Field label="Type">
            <select value={d.report_type} onChange={(e) => set("report_type", e.target.value as ReportInput["report_type"])} className={input}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={d.status} onChange={(e) => set("status", e.target.value as ReportInput["status"])} className={input}>
              <option value="draft">Draft</option><option value="final">Final</option><option value="signed">Signed</option>
            </select>
          </Field>
          <Field label="Patient name">
            <input value={d.patient_name ?? ""} onChange={(e) => set("patient_name", e.target.value)} className={input} />
          </Field>
          <Field label="Patient ID">
            <input value={d.patient_id ?? ""} onChange={(e) => set("patient_id", e.target.value)} className={input} />
          </Field>
          <Field label="Period start">
            <input type="datetime-local" value={(d.period_start ?? "").slice(0,16)} onChange={(e) => set("period_start", e.target.value)} className={input} />
          </Field>
          <Field label="Period end">
            <input type="datetime-local" value={(d.period_end ?? "").slice(0,16)} onChange={(e) => set("period_end", e.target.value)} className={input} />
          </Field>
          <Field label="Severity">
            <select value={d.severity ?? "moderate"} onChange={(e) => set("severity", e.target.value as ReportInput["severity"])} className={input}>
              <option value="low">Low</option><option value="moderate">Moderate</option>
              <option value="high">High</option><option value="critical">Critical</option>
            </select>
          </Field>

          <fieldset className="sm:col-span-2 grid grid-cols-2 gap-3 rounded-xl border border-border p-3 sm:grid-cols-5">
            <legend className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground">Metrics</legend>
            <NumField label="Avg Hz" v={d.metrics?.avgTremorHz} onChange={(n) => setMetric("avgTremorHz", n)} step={0.1} />
            <NumField label="Peak Hz" v={d.metrics?.peakTremorHz} onChange={(n) => setMetric("peakTremorHz", n)} step={0.1} />
            <NumField label="EMG RMS" v={d.metrics?.emgRms} onChange={(n) => setMetric("emgRms", n)} step={0.01} />
            <NumField label="Episodes" v={d.metrics?.episodeCount} onChange={(n) => setMetric("episodeCount", n)} step={1} />
            <NumField label="Minutes" v={d.metrics?.sessionMinutes} onChange={(n) => setMetric("sessionMinutes", n)} step={1} />
          </fieldset>

          <Field label="Clinical summary" full>
            <textarea rows={3} value={d.summary ?? ""} onChange={(e) => set("summary", e.target.value)} className={input} />
          </Field>
          <Field label="Findings" full>
            <textarea rows={4} value={d.findings ?? ""} onChange={(e) => set("findings", e.target.value)} className={input} />
          </Field>
          <Field label="Recommendations" full>
            <textarea rows={3} value={d.recommendations ?? ""} onChange={(e) => set("recommendations", e.target.value)} className={input} />
          </Field>

          {error && (
            <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error.message}
            </div>
          )}

          <div className="sm:col-span-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className={btn}>Cancel</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-60">
              {saving ? "Saving…" : initial.id ? "Save changes" : "Create report"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function NumField({ label, v, onChange, step }: { label: string; v: number | null | undefined; onChange: (n: number | null) => void; step?: number }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="number" step={step ?? 1} value={v ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className={input} />
    </label>
  );
}

const input =
  "w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const pillSelect =
  "rounded-xl border border-border bg-background/40 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40";
const btn =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs hover:bg-white/5";
