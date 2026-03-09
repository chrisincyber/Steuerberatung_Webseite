-- ============================================================
-- Petertil Tax – Limit admin accounts to exactly one
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Unique partial index: only one row can have role = 'admin'
CREATE UNIQUE INDEX IF NOT EXISTS one_admin_only
  ON public.profiles ((true))
  WHERE role = 'admin';

-- Trigger to prevent setting role to 'admin' if one already exists
CREATE OR REPLACE FUNCTION public.enforce_single_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' AND (OLD.role IS NULL OR OLD.role <> 'admin') THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin' AND id <> NEW.id) THEN
      RAISE EXCEPTION 'Only one admin account is allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_admin_trigger ON public.profiles;
CREATE TRIGGER enforce_single_admin_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_admin();
