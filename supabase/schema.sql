-- Steuerberatung Petertil - Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  notification_email BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TAX DECLARATIONS
-- ============================================
CREATE TABLE public.declarations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'documents_outstanding'
    CHECK (status IN ('documents_outstanding', 'in_progress', 'review', 'completed')),
  tier TEXT NOT NULL DEFAULT 'basic'
    CHECK (tier IN ('basic', 'standard', 'premium')),
  price DECIMAL(10,2),
  canton TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own declarations"
  ON public.declarations FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all declarations"
  ON public.declarations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update declarations"
  ON public.declarations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert declarations"
  ON public.declarations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  declaration_id UUID REFERENCES public.declarations(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by TEXT NOT NULL CHECK (uploaded_by IN ('client', 'admin')),
  document_type TEXT DEFAULT 'upload' CHECK (document_type IN ('upload', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Auto-delete after configurable period
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days')
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = client_id AND uploaded_by = 'client');

CREATE POLICY "Admins can manage all documents"
  ON public.documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  declaration_id UUID REFERENCES public.declarations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  declaration_id UUID REFERENCES public.declarations(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CHF',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'bank_transfer')),
  stripe_payment_intent_id TEXT,
  invoice_number TEXT UNIQUE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all invoices"
  ON public.invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- NOTIFICATIONS LOG
-- ============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  template TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- REFERRAL CODES
-- ============================================
CREATE TABLE public.referral_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 20.00,
  active BOOLEAN DEFAULT TRUE,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active referral codes"
  ON public.referral_codes FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admins can manage referral codes"
  ON public.referral_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ADMIN NOTES
-- ============================================
CREATE TABLE public.admin_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notes"
  ON public.admin_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', FALSE)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
CREATE POLICY "Clients can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Clients can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Admins can manage all documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_declarations_updated_at
  BEFORE UPDATE ON public.declarations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Clean up expired documents (run periodically via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_documents()
RETURNS void AS $$
BEGIN
  DELETE FROM public.documents WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
