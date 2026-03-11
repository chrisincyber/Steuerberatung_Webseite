-- Add is_abo column to tax_years for subscription tracking
ALTER TABLE public.tax_years
  ADD COLUMN IF NOT EXISTS is_abo BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN public.tax_years.is_abo IS 'Whether this tax year was ordered as a subscription (10% discount, min 2 year commitment). NULL = legacy/one-time.';
