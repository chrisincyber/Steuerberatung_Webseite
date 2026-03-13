-- Checklists: stores per-tax-year checklist configuration
CREATE TABLE public.checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_year_id UUID REFERENCES tax_years(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Checklist Vorlagen: reusable templates for future years
CREATE TABLE public.checklist_vorlagen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Meine Vorlage',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS for checklists
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists"
  ON public.checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists"
  ON public.checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
  ON public.checklists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists"
  ON public.checklists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for checklist_vorlagen
ALTER TABLE public.checklist_vorlagen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vorlagen"
  ON public.checklist_vorlagen FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vorlagen"
  ON public.checklist_vorlagen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vorlagen"
  ON public.checklist_vorlagen FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vorlagen"
  ON public.checklist_vorlagen FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at for checklists
CREATE OR REPLACE FUNCTION update_checklists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_checklists_updated_at();
