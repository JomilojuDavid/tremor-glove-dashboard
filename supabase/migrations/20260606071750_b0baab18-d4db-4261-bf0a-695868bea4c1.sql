
CREATE TABLE public.clinical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'session',
  status TEXT NOT NULL DEFAULT 'draft',
  patient_id TEXT,
  patient_name TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  severity TEXT,
  summary TEXT,
  findings TEXT,
  recommendations TEXT,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  signed_by TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_reports TO authenticated;
GRANT ALL ON public.clinical_reports TO service_role;

ALTER TABLE public.clinical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reports" ON public.clinical_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reports" ON public.clinical_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reports" ON public.clinical_reports
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reports" ON public.clinical_reports
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_clinical_reports
  BEFORE UPDATE ON public.clinical_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX clinical_reports_user_created_idx
  ON public.clinical_reports (user_id, created_at DESC);
