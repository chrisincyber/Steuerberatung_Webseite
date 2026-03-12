-- Konkubinat partners table
CREATE TABLE public.konkubinat_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthday DATE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE konkubinat_partners ENABLE ROW LEVEL SECURITY;

-- Clients: own partner only
CREATE POLICY "Users select own partner" ON konkubinat_partners FOR SELECT USING (auth.uid() = primary_user_id);
CREATE POLICY "Users insert own partner" ON konkubinat_partners FOR INSERT WITH CHECK (auth.uid() = primary_user_id);
CREATE POLICY "Users update own partner" ON konkubinat_partners FOR UPDATE USING (auth.uid() = primary_user_id);
CREATE POLICY "Users delete own partner" ON konkubinat_partners FOR DELETE USING (auth.uid() = primary_user_id);

-- Admins: all
CREATE POLICY "Admins select all partners" ON konkubinat_partners FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Add partner_id to tax_years
ALTER TABLE tax_years ADD COLUMN partner_id UUID REFERENCES konkubinat_partners(id) ON DELETE SET NULL;

-- Replace old unique constraint with partial indexes
-- (allows one self + one partner row per user+year)
ALTER TABLE tax_years DROP CONSTRAINT IF EXISTS tax_years_user_id_year_key;
CREATE UNIQUE INDEX tax_years_user_year_self ON tax_years(user_id, year) WHERE partner_id IS NULL;
CREATE UNIQUE INDEX tax_years_user_year_partner ON tax_years(user_id, year, partner_id) WHERE partner_id IS NOT NULL;
