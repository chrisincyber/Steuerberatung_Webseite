-- Add birthday and zivilstand columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zivilstand text;
