
DROP POLICY IF EXISTS "Authenticated can read allowed realtime topics" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can read realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated can read scoped realtime topics" ON realtime.messages;

CREATE POLICY "Authenticated can read scoped realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() IN ('chat_messages', 'messages') THEN true
    WHEN realtime.topic() = 'races' THEN EXISTS (
      SELECT 1 FROM public.races r
      WHERE r.host_id = auth.uid()
         OR EXISTS (
           SELECT 1 FROM public.race_participants rp
           WHERE rp.race_id = r.id AND rp.user_id = auth.uid()
         )
    )
    WHEN realtime.topic() = 'race_participants' THEN EXISTS (
      SELECT 1 FROM public.race_participants rp
      WHERE rp.user_id = auth.uid()
    )
    ELSE false
  END
);
