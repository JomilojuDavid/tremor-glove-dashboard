
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mrn TEXT,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  sex TEXT,
  condition TEXT,
  handedness TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own patients" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own patients" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own patients" ON public.patients FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER patients_set_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX patients_user_idx ON public.patients(user_id, created_at DESC);

CREATE TABLE public.patient_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes NUMERIC,
  avg_tremor_hz NUMERIC,
  peak_tremor_hz NUMERIC,
  emg_rms NUMERIC,
  episode_count INTEGER,
  severity TEXT,
  device_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_sessions TO authenticated;
GRANT ALL ON public.patient_sessions TO service_role;
ALTER TABLE public.patient_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sessions" ON public.patient_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.patient_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.patient_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.patient_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER patient_sessions_set_updated_at BEFORE UPDATE ON public.patient_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX patient_sessions_patient_idx ON public.patient_sessions(patient_id, started_at DESC);
CREATE INDEX patient_sessions_user_idx ON public.patient_sessions(user_id, started_at DESC);
