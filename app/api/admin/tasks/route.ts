import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';
export async function PUT(req: Request) {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Introduce el PIN de padres.' }, { status: 403 });
  const { tasks } = await req.json();
  if (
    !Array.isArray(tasks) ||
    tasks.length > 30 ||
    tasks.some(
      (t) =>
        typeof t.title !== 'string' ||
        !t.title.trim() ||
        t.title.length > 60 ||
        typeof t.description !== 'string' ||
        !t.description.trim() ||
        !Number.isInteger(Number(t.amountCents)) ||
        Number(t.amountCents) < 1 ||
        typeof t.icon !== 'string' ||
        !t.icon.trim(),
    )
  )
    return NextResponse.json(
      { error: 'Revisa las tareas: nombre, descripción, icono e importe son obligatorios.' },
      { status: 400 },
    );
  db.transaction(() => {
    const previous = db.prepare('SELECT id FROM tasks').all() as { id: number }[];
    const ids = tasks.filter((t) => Number.isInteger(t.id)).map((t) => Number(t.id));
    for (const t of previous)
      if (!ids.includes(t.id)) db.prepare('DELETE FROM tasks WHERE id=?').run(t.id);
    for (const t of tasks) {
      if (Number.isInteger(t.id))
        db.prepare('UPDATE tasks SET title=?,description=?,amount_cents=?,icon=? WHERE id=?').run(
          t.title.trim(),
          t.description.trim(),
          Number(t.amountCents),
          t.icon,
          t.id,
        );
      else
        db.prepare('INSERT INTO tasks(title,description,amount_cents,icon) VALUES(?,?,?,?)').run(
          t.title.trim(),
          t.description.trim(),
          Number(t.amountCents),
          t.icon,
        );
    }
  }).immediate();
  return NextResponse.json({ ok: true });
}
