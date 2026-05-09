DROP POLICY IF EXISTS "Authenticated can read scoped realtime topics" ON realtime.messages;

CREATE POLICY "Authenticated can read scoped realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() IN ('chat_messages', 'messages') THEN true
    WHEN realtime.topic() LIKE 'race-%' THEN EXISTS (
      SELECT 1 FROM public.races r
      WHERE r.id::text = substring(realtime.topic() from 6)
        AND (
          r.host_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.race_participants rp
            WHERE rp.race_id = r.id AND rp.user_id = auth.uid()
          )
        )
    )
    ELSE false
  END
);