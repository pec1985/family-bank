import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';
export async function PUT(req: Request) {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Introduce el PIN de padres.' }, { status: 403 });
  const body = await req.json(),
    currentPin = String(body.currentPin ?? ''),
    newPin = String(body.newPin ?? '');
  const current = db.prepare("SELECT value FROM app_settings WHERE key='secret_pin'").get() as
    { value: string } | undefined;
  if (!current || currentPin !== current.value)
    return NextResponse.json({ error: 'El PIN actual no es correcto.' }, { status: 401 });
  if (!/^\d{4}$/.test(newPin))
    return NextResponse.json({ error: 'El nuevo PIN debe tener 4 cifras.' }, { status: 400 });
  db.prepare(
    "INSERT INTO app_settings(key,value) VALUES('secret_pin',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  ).run(newPin);
  return NextResponse.json({ ok: true });
}
