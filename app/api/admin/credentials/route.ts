import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';
export async function PUT(req: Request) {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Introduce el PIN de padres.' }, { status: 403 });
  const body = await req.json(),
    currentPassword = String(body.currentPassword ?? ''),
    username = String(body.username ?? '').trim(),
    newPassword = String(body.newPassword ?? '');
  if (!currentPassword)
    return NextResponse.json({ error: 'Escribe la contraseña actual.' }, { status: 400 });
  if (!username)
    return NextResponse.json({ error: 'Escribe un nombre de usuario.' }, { status: 400 });
  if (newPassword && newPassword.length < 4)
    return NextResponse.json(
      { error: 'La nueva contraseña debe tener al menos 4 caracteres.' },
      { status: 400 },
    );
  const user = db.prepare('SELECT id,password FROM users ORDER BY id LIMIT 1').get() as
    { id: number; password: string } | undefined;
  if (!user || user.password !== currentPassword)
    return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 401 });
  try {
    if (newPassword)
      db.prepare('UPDATE users SET username=?,password=? WHERE id=?').run(
        username,
        newPassword,
        user.id,
      );
    else db.prepare('UPDATE users SET username=? WHERE id=?').run(username, user.id);
  } catch {
    return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso.' }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
