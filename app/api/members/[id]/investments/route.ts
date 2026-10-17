import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isParentAuthorized } from '@/lib/parent-auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isParentAuthorized(req)))
    return NextResponse.json({ error: 'Solo un padre puede editar estas metas.' }, { status: 403 });
  const { id } = await params;
  const { name, icon = '🌟' } = await req.json();
  const cleanName = typeof name === 'string' ? name.trim().slice(0, 60) : '';
  if (!cleanName)
    return NextResponse.json({ error: 'Ponle un nombre a este objetivo.' }, { status: 400 });
  const count = (
    db.prepare('SELECT COUNT(*) count FROM investments WHERE member_id=?').get(id) as {
      count: number;
    }
  ).count;
  if (count >= 5)
    return NextResponse.json({ error: 'Puedes guardar hasta cinco objetivos.' }, { status: 400 });
  const result = db
    .prepare('INSERT INTO investments (member_id,name,icon) VALUES (?,?,?)')
    .run(id, cleanName, typeof icon === 'string' ? icon : '🌟');
  return NextResponse.json({ ok: true, id: result.lastInsertRowid });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isParentAuthorized(req)))
    return NextResponse.json({ error: 'Solo un padre puede editar estas metas.' }, { status: 403 });
  const { id } = await params;
  const { goals } = await req.json();
  if (
    !Array.isArray(goals) ||
    goals.length > 5 ||
    goals.some(
      (goal) => typeof goal.name !== 'string' || !goal.name.trim() || goal.name.trim().length > 60,
    )
  ) {
    return NextResponse.json(
      { error: 'Revisa los nombres de las metas (máximo cinco).' },
      { status: 400 },
    );
  }
  const save = db.transaction(() => {
    const current = db
      .prepare('SELECT id,balance_cents AS balanceCents FROM investments WHERE member_id=?')
      .all(id) as { id: number; balanceCents: number }[];
    const ids = goals.filter((goal) => Number.isInteger(goal.id)).map((goal) => Number(goal.id));
    if (ids.some((goalId) => !current.some((row) => row.id === goalId))) return 'invalid';
    const removed = current.filter((row) => !ids.includes(row.id));
    if (removed.some((row) => row.balanceCents > 0)) return 'balance';
    for (const goal of goals) {
      const name = goal.name.trim();
      if (Number.isInteger(goal.id))
        db.prepare('UPDATE investments SET name=? WHERE id=? AND member_id=?').run(
          name,
          goal.id,
          id,
        );
      else
        db.prepare('INSERT INTO investments (member_id,name,icon) VALUES (?,?,?)').run(
          id,
          name,
          typeof goal.icon === 'string' ? goal.icon : '🌟',
        );
    }
    for (const row of removed) db.prepare('DELETE FROM investments WHERE id=?').run(row.id);
    return 'ok';
  });
  const result = save();
  if (result === 'invalid')
    return NextResponse.json(
      { error: 'Una de las metas no pertenece a este perfil.' },
      { status: 400 },
    );
  if (result === 'balance')
    return NextResponse.json(
      { error: 'No se puede eliminar una meta que ya tiene dinero ahorrado.' },
      { status: 400 },
    );
  return NextResponse.json({ ok: true });
}
