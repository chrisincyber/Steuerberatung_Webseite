-- Add tool_type to tax_calculations
ALTER TABLE public.tax_calculations
  ADD COLUMN IF NOT EXISTS tool_type TEXT NOT NULL DEFAULT 'steuerrechner';

-- Leads table for non-authenticated PDF downloads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  tool_type TEXT NOT NULL,
  form_data JSONB,
  locale TEXT NOT NULL DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
