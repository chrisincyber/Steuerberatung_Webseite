-- Add express fields to tax_years
ALTER TABLE tax_years ADD COLUMN IF NOT EXISTS express boolean DEFAULT false;
ALTER TABLE tax_years ADD COLUMN IF NOT EXISTS express_confirmed_at timestamptz;
