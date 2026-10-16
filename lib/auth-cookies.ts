async function signingKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('SESSION_SECRET must contain at least 32 characters.');
  return globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function tokenFor(purpose: string, maxAge: number) {
  const payload = `${Math.floor(Date.now() / 1000) + maxAge}.${globalThis.crypto.randomUUID()}`;
  const signature = new Uint8Array(
    await globalThis.crypto.subtle.sign(
      'HMAC',
      await signingKey(),
      new TextEncoder().encode(`${purpose}:${payload}`),
    ),
  );
  return `${payload}.${Array.from(signature, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export async function validAuthCookie(
  value: string | undefined,
  purpose: 'session' | 'admin' | 'parent',
) {
  if (!value || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) return false;
  const match = /^(\d+)\.([a-f0-9-]{36})\.([a-f0-9]{64})$/.exec(value);
  if (!match || Number(match[1]) <= Math.floor(Date.now() / 1000)) return false;
  const signature = Uint8Array.from(match[3].match(/../g)!, (byte) => parseInt(byte, 16));
  return globalThis.crypto.subtle.verify(
    'HMAC',
    await signingKey(),
    signature,
    new TextEncoder().encode(`family-bank:${purpose}:${match[1]}.${match[2]}`),
  );
}

export const sessionCookieValue = () => tokenFor('family-bank:session', 60 * 60 * 24 * 7);
export const adminCookieValue = () => tokenFor('family-bank:admin', 60 * 60 * 4);
export const parentCookieValue = (maxAge = 60 * 60 * 4) => tokenFor('family-bank:parent', maxAge);

export function secureCookie() {
  return process.env.NODE_ENV === 'production';
}
