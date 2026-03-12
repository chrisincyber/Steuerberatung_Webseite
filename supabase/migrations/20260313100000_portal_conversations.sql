CREATE TABLE IF NOT EXISTS public.portal_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_conversations_status ON portal_conversations(status, archived, last_message_at DESC);

ALTER TABLE public.portal_conversations ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins select conversations" ON portal_conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins insert conversations" ON portal_conversations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins update conversations" ON portal_conversations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Clients: own conversation only
CREATE POLICY "Clients select own conversation" ON portal_conversations FOR SELECT
  USING (auth.uid() = client_id);

-- Auto-update last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO portal_conversations (client_id, last_message_at)
  VALUES (NEW.client_id, NEW.created_at)
  ON CONFLICT (client_id)
  DO UPDATE SET last_message_at = NEW.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON portal_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
