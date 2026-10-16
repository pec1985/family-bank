import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isParentAuthorized } from '@/lib/parent-auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isParentAuthorized(req)))
    return NextResponse.json({ error: 'Solo un padre puede editar este perfil.' }, { status: 403 });
  const { id } = await params;
  const { avatar } = await req.json();
  if (
    typeof avatar !== 'string' ||
    !avatar.startsWith('data:image/jpeg;base64,') ||
    avatar.length > 1_500_000
  ) {
    return NextResponse.json(
      { error: 'La imagen no es válida o pesa demasiado.' },
      { status: 400 },
    );
  }
  const result = db.prepare('UPDATE members SET avatar=? WHERE id=?').run(avatar, id);
  if (!result.changes)
    return NextResponse.json({ error: 'No se encontró el perfil.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
