// Client-side disposable email blocklist for instant UX feedback.
// Server-side enforcement (in the auth trigger) is the source of truth.
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  '10minutemail.com','10minutemail.net','20minutemail.com','30minutemail.com',
  'mailinator.com','mailinator.net','mailinator.org','mailinator2.com','mailinator.live',
  'guerrillamail.com','guerrillamail.net','guerrillamail.org','guerrillamail.biz','guerrillamail.de',
  'sharklasers.com','grr.la','guerrillamailblock.com','pokemail.net','spam4.me',
  'temp-mail.org','temp-mail.io','temp-mail.ru','tempmail.com','tempmail.net','tempmail.dev',
  'tempmail.email','tempmail.plus','tempmailo.com','tempmailaddress.com','tempr.email',
  'throwawaymail.com','throwaway.email','yopmail.com','yopmail.net','yopmail.fr',
  'dispostable.com','discard.email','discardmail.com','fakeinbox.com','getnada.com',
  'nada.email','inboxbear.com','inboxkitten.com','mohmal.com','emailondeck.com',
  'mailcatch.com','maildrop.cc','mailnesia.com','mintemail.com','trashmail.com',
  'trashmail.de','trashmail.net','trashmail.me','trashymail.com','fakemail.net',
  'emailfake.com','email-fake.com','jourrapide.com','mailto.plus','fexpost.com',
  'fexbox.org','mailbox.in.ua','mailpoof.com','harakirimail.com','throwam.com',
  'mytemp.email','one-time.email','temp-inbox.com','temporarymail.com','any.pink',
]);

export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;
  // Match subdomains (e.g. foo.mailinator.com)
  for (const d of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith('.' + d)) return true;
  }
  return false;
}