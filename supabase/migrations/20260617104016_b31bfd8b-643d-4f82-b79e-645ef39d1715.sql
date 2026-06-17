CREATE TABLE IF NOT EXISTS public.disposable_email_domains (
  domain text PRIMARY KEY,
  added_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.disposable_email_domains TO authenticated;
GRANT SELECT ON public.disposable_email_domains TO anon;
GRANT ALL ON public.disposable_email_domains TO service_role;

ALTER TABLE public.disposable_email_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read disposable domains" ON public.disposable_email_domains;
CREATE POLICY "Public can read disposable domains"
ON public.disposable_email_domains
FOR SELECT
USING (true);

INSERT INTO public.disposable_email_domains (domain) VALUES
  ('10minutemail.com'),('10minutemail.net'),('20minutemail.com'),('30minutemail.com'),
  ('mailinator.com'),('mailinator.net'),('mailinator.org'),('mailinator2.com'),('mailinator.live'),
  ('guerrillamail.com'),('guerrillamail.net'),('guerrillamail.org'),('guerrillamail.biz'),
  ('guerrillamail.de'),('sharklasers.com'),('grr.la'),('guerrillamailblock.com'),
  ('pokemail.net'),('spam4.me'),('temp-mail.org'),('temp-mail.io'),('temp-mail.ru'),
  ('tempmail.com'),('tempmail.net'),('tempmail.dev'),('tempmail.email'),('tempmail.plus'),
  ('tempmailo.com'),('tempmailaddress.com'),('tempr.email'),('throwawaymail.com'),
  ('throwaway.email'),('yopmail.com'),('yopmail.net'),('yopmail.fr'),('cool.fr.nf'),
  ('jetable.fr.nf'),('nospam.ze.tc'),('nomail.xl.cx'),('mega.zik.dj'),('speed.1s.fr'),
  ('courriel.fr.nf'),('moncourrier.fr.nf'),('monemail.fr.nf'),('monmail.fr.nf'),
  ('dispostable.com'),('discard.email'),('discardmail.com'),('discardmail.de'),
  ('fakeinbox.com'),('fakemailgenerator.com'),('getairmail.com'),('getnada.com'),
  ('nada.email'),('inboxbear.com'),('inboxkitten.com'),('mohmal.com'),('emailondeck.com'),
  ('mailcatch.com'),('maildrop.cc'),('mailnesia.com'),('mailnull.com'),('mintemail.com'),
  ('mt2015.com'),('mytemp.email'),('owlpic.com'),('rcpt.at'),('safetymail.info'),
  ('safetypost.de'),('sendspamhere.com'),('smellfear.com'),('snakemail.com'),
  ('sneakemail.com'),('sofort-mail.de'),('sogetthis.com'),('spambog.com'),('spambog.de'),
  ('spambog.ru'),('spambox.us'),('spamcero.com'),('spamfree24.com'),('spamfree24.de'),
  ('spamfree24.eu'),('spamfree24.info'),('spamfree24.net'),('spamfree24.org'),
  ('spamgoes.in'),('spamherelots.com'),('spamhereplease.com'),('spamhole.com'),
  ('spamify.com'),('spaminator.de'),('spamkill.info'),('spaml.com'),('spaml.de'),
  ('spammotel.com'),('spamobox.com'),('spamspot.com'),('spamthis.co.uk'),('spamthisplease.com'),
  ('supergreatmail.com'),('thisisnotmyrealemail.com'),('tilien.com'),
  ('trash-amil.com'),('trash-mail.at'),('trash-mail.com'),('trash-mail.de'),('trash2009.com'),
  ('trashemail.de'),('trashmail.at'),('trashmail.com'),('trashmail.de'),('trashmail.me'),
  ('trashmail.net'),('trashmail.org'),('trashmail.ws'),('trashymail.com'),('trashymail.net'),
  ('tyldd.com'),('uggsrock.com'),('wegwerfadresse.de'),('wegwerfemail.de'),('wegwerfmail.de'),
  ('wegwerfmail.info'),('wegwerfmail.net'),('wegwerfmail.org'),('wh4f.org'),('whyspam.me'),
  ('willhackforfood.biz'),('willselfdestruct.com'),('winemaven.info'),('wronghead.com'),
  ('wuzup.net'),('wuzupmail.net'),('xagloo.com'),('xemaps.com'),('xents.com'),('xmaily.com'),
  ('xoxy.net'),('yapped.net'),('yep.it'),('yogamaven.com'),('yuurok.com'),
  ('zehnminutenmail.de'),('zippymail.in'),('zoaxe.com'),('zoemail.org'),('fakemail.net'),
  ('fakemail.fr'),('mvrht.com'),('mvrht.net'),('mailtemp.info'),('linshiyou.com'),
  ('boximail.com'),('clrmail.com'),('emaildrop.io'),('emailfake.com'),('email-fake.com'),
  ('email-temp.com'),('etranquil.com'),('etranquil.net'),('etranquil.org'),
  ('fakermail.com'),('flurred.com'),('harakirimail.com'),('hidemail.de'),('hochsitze.com'),
  ('hulapla.de'),('imails.info'),('instant-mail.de'),('jourrapide.com'),('kasmail.com'),
  ('keepmymail.com'),('killmail.com'),('killmail.net'),('kir.ch.tc'),('klzlk.com'),
  ('koszmail.pl'),('kurzepost.de'),('lawlita.com'),('lifebyfood.com'),('link2mail.net'),
  ('litedrop.com'),('lookugly.com'),('lortemail.dk'),('lr78.com'),('m4ilweb.info'),
  ('mailbidon.com'),('mailblocks.com'),('mailbucket.org'),('mailde.de'),('mailde.info'),
  ('mailexpire.com'),('mailfa.tk'),('mailforspam.com'),('mailfreeonline.com'),
  ('mailguard.me'),('mailimate.com'),('mailin8r.com'),('mailme.lv'),('mailme24.com'),
  ('mailmetrash.com'),('mailmoat.com'),('mailms.com'),('mailnator.com'),('mailorg.org'),
  ('mailpick.biz'),('mailrock.biz'),('mailscrap.com'),('mailshell.com'),('mailsiphon.com'),
  ('mailtome.de'),('mailtothis.com'),('mailtrash.net'),('mailtv.net'),('mailzilla.com'),
  ('makemetheking.com'),('manybrain.com'),('mbx.cc'),('meltmail.com'),
  ('messagebeamer.de'),('moburl.com'),('msa.minsmail.com'),('mt2014.com'),
  ('myemailboxy.com'),('mymail-in.net'),('mypartyclip.de'),('myphantomemail.com'),
  ('mysamp.de'),('mytempemail.com'),('neomailbox.com'),('nepwk.com'),('nervmich.net'),
  ('nervtmich.net'),('nice-4u.com'),('no-spam.ws'),('noblepioneer.com'),('nogmailspam.info'),
  ('nomail2me.com'),('nospam4.us'),('nospamfor.us'),('nospammail.net'),('notmailinator.com'),
  ('nowmymail.com'),('nurfuerspam.de'),('nwldx.com'),('objectmail.com'),('obobbo.com'),
  ('odaymail.com'),('one-time.email'),('onewaymail.com'),('onlatedotcom.info'),
  ('online.ms'),('opayq.com'),('ordinaryamerican.net'),('otherinbox.com'),('ovpn.to'),
  ('pancakemail.com'),('pjjkp.com'),('plexolan.de'),('poofy.org'),('pookmail.com'),
  ('proxymail.eu'),('prtnx.com'),('punkass.com'),('putthisinyourspamdatabase.com'),
  ('quickinbox.com'),('rapidinbox.com'),('reallymymail.com'),('recode.me'),('recursor.net'),
  ('regbypass.com'),('rmqkr.net'),('rppkn.com'),('s0ny.net'),('saynotospams.com'),
  ('schafmail.de'),('schrott-email.de'),('selfdestructingmail.com'),('shieldedmail.com'),
  ('shiftmail.com'),('shitmail.me'),('shitware.nl'),('shmeriously.com'),('shortmail.net'),
  ('skeefmail.com'),('slaskpost.se'),('slopsbox.com'),('snkmail.com'),('mailto.plus'),
  ('fexpost.com'),('fexbox.org'),('mailbox.in.ua'),('rover.info'),('chitthi.in'),
  ('fextemp.com'),('any.pink'),('merepost.com'),('binkmail.com'),('inbox.lv'),
  ('mail-temp.com'),('vomoto.com'),('zetmail.com'),('temporarymail.com'),
  ('temp-inbox.com'),('throwam.com'),('mailpoof.com'),('byom.de'),('crymail2.com')
ON CONFLICT (domain) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_disposable_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_domain text;
BEGIN
  IF p_email IS NULL OR position('@' IN p_email) = 0 THEN
    RETURN false;
  END IF;

  v_domain := lower(split_part(p_email, '@', 2));

  IF EXISTS (SELECT 1 FROM public.disposable_email_domains WHERE domain = v_domain) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.disposable_email_domains d
    WHERE v_domain LIKE '%.' || d.domain
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
BEGIN
  IF public.is_disposable_email(NEW.email) THEN
    RAISE EXCEPTION 'Disposable or temporary email addresses are not allowed. Please sign up with a permanent email address.'
      USING ERRCODE = 'check_violation';
  END IF;

  v_username := NEW.raw_user_meta_data ->> 'username';

  IF v_username IS NULL OR TRIM(v_username) = '' THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  ELSE
    v_username := TRIM(v_username);
  END IF;

  IF LENGTH(v_username) < 3 THEN
    v_username := v_username || '_user';
  END IF;

  IF LENGTH(v_username) > 50 THEN
    v_username := substr(v_username, 1, 50);
  END IF;

  v_username := regexp_replace(v_username, '[^a-zA-Z0-9_-]', '_', 'g');

  IF LENGTH(v_username) < 3 THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, v_username);

  RETURN NEW;
END;
$$;