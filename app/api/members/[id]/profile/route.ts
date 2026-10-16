import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isParentAuthorized } from '@/lib/parent-auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isParentAuthorized(req)))
    return NextResponse.json({ error: 'Solo un padre puede editar este perfil.' }, { status: 403 });
  const { id } = await params;
  const { age } = await req.json();
  const parsedAge = age === '' || age === null ? null : Number(age);
  if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 18)) {
    return NextResponse.json({ error: 'Indica una edad entre 1 y 18 años.' }, { status: 400 });
  }
  const result = db.prepare('UPDATE members SET age=? WHERE id=?').run(parsedAge, id);
  if (!result.changes)
    return NextResponse.json({ error: 'No se encontró el perfil.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
