-- Tax calculations table for saved Steuerrechner results
CREATE TABLE IF NOT EXISTS public.tax_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Steuerberechnung',
  form_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  mode TEXT NOT NULL DEFAULT 'simple' CHECK (mode IN ('simple', 'complex')),
  locale TEXT NOT NULL DEFAULT 'de' CHECK (locale IN ('de', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calculations"
  ON public.tax_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON public.tax_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations"
  ON public.tax_calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON public.tax_calculations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_tax_calculations_user_id ON public.tax_calculations(user_id);
