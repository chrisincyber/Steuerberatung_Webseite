CREATE TABLE IF NOT EXISTS public.portal_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 5000),
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_messages_client ON portal_messages(client_id, created_at ASC);
CREATE INDEX idx_portal_messages_unread ON portal_messages(client_id, read_at) WHERE read_at IS NULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_messages;
ALTER TABLE public.portal_messages ENABLE ROW LEVEL SECURITY;

-- Clients: own messages only
CREATE POLICY "Clients select own" ON portal_messages FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients insert own" ON portal_messages FOR INSERT
  WITH CHECK (auth.uid() = client_id AND auth.uid() = sender_id AND sender_role = 'client');
CREATE POLICY "Clients update own" ON portal_messages FOR UPDATE USING (auth.uid() = client_id);

-- Admins: all messages
CREATE POLICY "Admins select all" ON portal_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins insert all" ON portal_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') AND sender_role = 'admin');
CREATE POLICY "Admins update all" ON portal_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
