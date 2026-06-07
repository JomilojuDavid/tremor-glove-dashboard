import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PatientSchema = z.object({
  id: z.string().uuid().optional(),
  mrn: z.string().max(60).nullable().optional(),
  full_name: z.string().min(1).max(160),
  date_of_birth: z.string().nullable().optional(),
  sex: z.enum(["male", "female", "other", "unspecified"]).nullable().optional(),
  condition: z.string().max(200).nullable().optional(),
  handedness: z.enum(["left", "right", "ambidextrous"]).nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal("")),
  contact_phone: z.string().max(40).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  status: z.enum(["active", "archived"]).default("active"),
});
export type PatientInput = z.infer<typeof PatientSchema>;
export type PatientRow = PatientInput & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export const SessionSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  started_at: z.string(),
  duration_minutes: z.number().min(0).max(1440).nullable().optional(),
  avg_tremor_hz: z.number().min(0).max(50).nullable().optional(),
  peak_tremor_hz: z.number().min(0).max(50).nullable().optional(),
  emg_rms: z.number().min(0).max(10).nullable().optional(),
  episode_count: z.number().int().min(0).max(1000).nullable().optional(),
  severity: z.enum(["low", "moderate", "high", "critical"]).nullable().optional(),
  device_id: z.string().max(60).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});
export type SessionInput = z.infer<typeof SessionSchema>;
export type SessionRow = SessionInput & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export const listPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: (data ?? []) as PatientRow[] };
  });

export const upsertPatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PatientSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = { ...data, contact_email: data.contact_email || null, user_id: userId };
    const q = data.id
      ? supabase.from("patients").update(row).eq("id", data.id).eq("user_id", userId).select("*").single()
      : supabase.from("patients").insert(row).select("*").single();
    const { data: out, error } = await q;
    if (error) throw new Error(error.message);
    return { row: out as PatientRow };
  });

export const deletePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("patients").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ patient_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("patient_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("patient_id", data.patient_id)
      .order("started_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as SessionRow[] };
  });

export const upsertSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SessionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = { ...data, user_id: userId };
    const q = data.id
      ? supabase.from("patient_sessions").update(row).eq("id", data.id).eq("user_id", userId).select("*").single()
      : supabase.from("patient_sessions").insert(row).select("*").single();
    const { data: out, error } = await q;
    if (error) throw new Error(error.message);
    return { row: out as SessionRow };
  });

export const deleteSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("patient_sessions").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
