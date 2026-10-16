import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { adminCookieValue, parentCookieValue, secureCookie } from '@/lib/auth-cookies';
export async function POST(req: Request) {
  let pin: unknown;
  try {
    ({ pin } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Escribe el número secreto.' }, { status: 400 });
  }
  const setting = db.prepare("SELECT value FROM app_settings WHERE key='secret_pin'").get() as
    { value: string } | undefined;
  if (!setting || String(pin ?? '') !== setting.value)
    return NextResponse.json({ error: 'El número secreto no es correcto.' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set('family-bank-admin', await adminCookieValue(), {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4,
  });
  response.cookies.set('family-bank-parent', await parentCookieValue(), {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4,
  });
  return response;
}
