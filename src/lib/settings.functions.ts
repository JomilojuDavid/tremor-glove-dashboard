import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SettingsSchema = z.object({
  clinicianName: z.string().max(120).default(""),
  clinicianEmail: z.string().max(200).default(""),
  clinicianPhone: z.string().max(40).default(""),
  licenseNumber: z.string().max(60).default(""),
  organization: z.string().max(160).default(""),
  department: z.string().max(120).default(""),
  patientId: z.string().max(60).default(""),
  patientName: z.string().max(120).default(""),
  patientAge: z.number().min(0).max(120).default(0),
  patientSex: z.enum(["male", "female", "other"]).default("other"),
  deviceSerial: z.string().max(60).default(""),
  firmware: z.string().max(40).default(""),
  samplingHz: z.number().min(50).max(2000).default(200),
  tremorThreshold: z.number().min(0.1).max(20).default(4.5),
  emgGain: z.number().min(1).max(10000).default(1000),
  filterLow: z.number().min(0).max(500).default(20),
  filterHigh: z.number().min(10).max(2000).default(450),
  alertSound: z.boolean().default(true),
  emailAlerts: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
  alertEmail: z.string().max(200).default(""),
  alertPhone: z.string().max(40).default(""),
  severityFloor: z.enum(["low", "moderate", "high", "critical"]).default("moderate"),
  timezone: z.string().max(60).default("UTC"),
  language: z.enum(["en", "es", "fr", "de", "pt"]).default("en"),
  units: z.enum(["metric", "imperial"]).default("metric"),
  dateFormat: z.enum(["iso", "us", "eu"]).default("iso"),
  retentionDays: z.number().min(1).max(3650).default(90),
  anonymizeExports: z.boolean().default(true),
  shareTelemetry: z.boolean().default(false),
  reportHeader: z.string().max(200).default(""),
  reportFooter: z.string().max(400).default(""),
  autoReport: z.boolean().default(false),
  accentColor: z.enum(["blue", "emerald", "violet", "amber"]).default("blue"),
});

export type SettingsData = z.infer<typeof SettingsSchema>;

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_settings")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { data: (data?.data as Partial<SettingsData> | null) ?? null };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
