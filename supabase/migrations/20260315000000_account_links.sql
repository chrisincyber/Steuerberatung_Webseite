-- Account linking system for partner visibility

-- Table for linked accounts (bidirectional)
CREATE TABLE public.account_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_b_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_a_share_visible BOOLEAN DEFAULT TRUE NOT NULL,
  user_b_share_visible BOOLEAN DEFAULT TRUE NOT NULL,
  originated_from TEXT NOT NULL DEFAULT 'pin' CHECK (originated_from IN ('pin', 'claim')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_link CHECK (user_a_id != user_b_id)
);

-- Each user can only be in one link
CREATE UNIQUE INDEX account_links_user_a ON account_links(user_a_id);
CREATE UNIQUE INDEX account_links_user_b ON account_links(user_b_id);

ALTER TABLE account_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own links" ON account_links FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users delete own links" ON account_links FOR DELETE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Admins see all links" ON account_links FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Table for link PINs
CREATE TABLE public.link_pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pin_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  attempts INTEGER DEFAULT 0 NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE link_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own pins" ON link_pins FOR SELECT
  USING (auth.uid() = user_id);

-- Add claimed_by_user_id to konkubinat_partners
ALTER TABLE konkubinat_partners ADD COLUMN claimed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- RLS policy: linked users can view shared tax years
CREATE POLICY "Linked users view shared tax years" ON tax_years FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_links al
      WHERE (
        (al.user_a_id = auth.uid() AND al.user_b_id = tax_years.user_id AND al.user_b_share_visible = TRUE)
        OR
        (al.user_b_id = auth.uid() AND al.user_a_id = tax_years.user_id AND al.user_a_share_visible = TRUE)
      )
    )
  );
