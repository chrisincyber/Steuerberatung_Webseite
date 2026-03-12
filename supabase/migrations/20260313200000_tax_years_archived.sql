ALTER TABLE public.tax_years ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_tax_years_archived ON tax_years(user_id, archived, year DESC);
