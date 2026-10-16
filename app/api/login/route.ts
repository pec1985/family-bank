import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { secureCookie, sessionCookieValue, validAuthCookie } from '@/lib/auth-cookies';
export async function POST(req: Request) {
  const { username, password } = await req.json();
  const user = db
    .prepare('SELECT id FROM users WHERE username=? AND password=?')
    .get(username, password);
  if (!user)
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set('family-bank-session', await sessionCookieValue(), {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
export async function GET(req: Request) {
  const token = req.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('family-bank-session='))
    ?.slice('family-bank-session='.length);
  return NextResponse.json({ authenticated: await validAuthCookie(token, 'session') });
}
