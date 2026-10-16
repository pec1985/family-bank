import { NextResponse } from 'next/server';
import db from '@/lib/db';
const claim = db.transaction((memberId: number, taskId: number) => {
  const task = db
    .prepare('SELECT title,amount_cents AS amount FROM tasks WHERE id=?')
    .get(taskId) as { title: string; amount: number } | undefined;
  if (!task || !db.prepare('SELECT id FROM members WHERE id=?').get(memberId)) return false;
  db.prepare('UPDATE members SET cash_cents=cash_cents+? WHERE id=?').run(task.amount, memberId);
  db.prepare(
    "INSERT INTO transactions (member_id,task_id,kind,amount_cents,note) VALUES (?,?,'task',?,?)",
  ).run(memberId, taskId, task.amount, task.title);
  return true;
});
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const { id, taskId } = await params;
  const { code, title, amountCents, emoji, save } = await req.json();
  const pin = db.prepare("SELECT value FROM app_settings WHERE key='secret_pin'").get() as
    { value: string } | undefined;
  if (!pin || String(code ?? '') !== pin.value)
    return NextResponse.json({ error: 'El código no es correcto' }, { status: 401 });
  if (taskId === 'custom') {
    const cents = Number(amountCents);
    const cleanTitle = typeof title === 'string' ? title.trim().slice(0, 60) : '';
    if (!cleanTitle || !Number.isInteger(cents) || cents < 1 || cents > 1000000)
      return NextResponse.json(
        { error: 'Revisa el nombre y el valor de la tarea' },
        { status: 400 },
      );
    const addCustom = db.transaction(() => {
      if (!db.prepare('SELECT id FROM members WHERE id=?').get(id)) return false;
      let taskIdForLog: number | null = null;
      if (save) {
        const result = db
          .prepare('INSERT INTO tasks (title,description,amount_cents,icon) VALUES (?,?,?,?)')
          .run(
            cleanTitle,
            'Tarea añadida por la familia',
            cents,
            typeof emoji === 'string' ? emoji : '✨',
          );
        taskIdForLog = Number(result.lastInsertRowid);
      }
      db.prepare('UPDATE members SET cash_cents=cash_cents+? WHERE id=?').run(cents, id);
      db.prepare(
        "INSERT INTO transactions (member_id,task_id,kind,amount_cents,note) VALUES (?,?,'task',?,?)",
      ).run(id, taskIdForLog, cents, cleanTitle);
      return true;
    });
    if (!addCustom())
      return NextResponse.json({ error: 'No se encontró el miembro' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  if (!claim(Number(id), Number(taskId)))
    return NextResponse.json({ error: 'No se encontró la tarea o el miembro' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
