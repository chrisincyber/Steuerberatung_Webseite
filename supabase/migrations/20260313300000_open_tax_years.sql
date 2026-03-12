-- Tracks which years are globally "open" so new clients get them automatically
CREATE TABLE IF NOT EXISTS public.open_tax_years (
  year INTEGER PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.open_tax_years ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins manage open years" ON open_tax_years FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Clients: read only
CREATE POLICY "Clients read open years" ON open_tax_years FOR SELECT
  USING (auth.uid() IS NOT NULL);
