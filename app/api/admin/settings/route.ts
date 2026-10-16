import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';
export async function GET(req: Request) {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Introduce el PIN de padres.' }, { status: 403 });
  const setting = db
    .prepare("SELECT value FROM app_settings WHERE key='investment_multiplier'")
    .get() as { value: string } | undefined;
  const user = db.prepare('SELECT username FROM users ORDER BY id LIMIT 1').get() as
    { username: string } | undefined;
  return NextResponse.json({
    investmentMultiplier: setting?.value ?? '2',
    username: user?.username ?? '',
  });
}
export async function PUT(req: Request) {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Introduce el PIN de padres.' }, { status: 403 });
  const body = await req.json();
  const multiplier = Number(body.multiplier);
  if (!Number.isInteger(multiplier) || multiplier < 1 || multiplier > 10)
    return NextResponse.json(
      { error: 'El multiplicador debe ser un número entero entre 1 y 10.' },
      { status: 400 },
    );
  db.prepare(
    "INSERT INTO app_settings(key,value) VALUES('investment_multiplier',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  ).run(String(multiplier));
  return NextResponse.json({ ok: true });
}
