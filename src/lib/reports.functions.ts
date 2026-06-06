import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ReportSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  report_type: z.enum(["session", "weekly", "incident", "longitudinal"]).default("session"),
  status: z.enum(["draft", "final", "signed"]).default("draft"),
  patient_id: z.string().max(60).nullable().optional(),
  patient_name: z.string().max(160).nullable().optional(),
  period_start: z.string().nullable().optional(),
  period_end: z.string().nullable().optional(),
  severity: z.enum(["low", "moderate", "high", "critical"]).nullable().optional(),
  summary: z.string().max(4000).nullable().optional(),
  findings: z.string().max(8000).nullable().optional(),
  recommendations: z.string().max(4000).nullable().optional(),
  metrics: z
    .object({
      avgTremorHz: z.number().nullable().optional(),
      peakTremorHz: z.number().nullable().optional(),
      emgRms: z.number().nullable().optional(),
      episodeCount: z.number().int().nullable().optional(),
      sessionMinutes: z.number().nullable().optional(),
    })
    .partial()
    .default({}),
  signed_by: z.string().max(160).nullable().optional(),
  signed_at: z.string().nullable().optional(),
});

export type ReportInput = z.infer<typeof ReportSchema>;

export type ReportRow = ReportInput & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("clinical_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: (data ?? []) as ReportRow[] };
  });

export const upsertReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReportSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = { ...data, user_id: userId };
    const q = data.id
      ? supabase.from("clinical_reports").update(row).eq("id", data.id).eq("user_id", userId).select("*").single()
      : supabase.from("clinical_reports").insert(row).select("*").single();
    const { data: out, error } = await q;
    if (error) throw new Error(error.message);
    return { row: out as ReportRow };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("clinical_reports")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
