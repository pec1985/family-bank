import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Acceso de administrador requerido.' }, { status: 403 });

  let amountCents: unknown;
  let reason: unknown;
  try {
    ({ amountCents, reason } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Indica una cantidad válida.' }, { status: 400 });
  }
  if (typeof amountCents !== 'number' || !Number.isSafeInteger(amountCents) || amountCents < 1)
    return NextResponse.json({ error: 'Indica una cantidad válida.' }, { status: 400 });

  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 200)
    return NextResponse.json(
      { error: 'Indica el motivo de la retirada (máximo 200 caracteres).' },
      { status: 400 },
    );
  const note = `Retirada de efectivo: ${reason.trim()}`;

  const { id } = await params;
  const cents = amountCents;
  const result = db.transaction(() => {
    const member = db.prepare('SELECT cash_cents AS cashCents FROM members WHERE id=?').get(id) as
      { cashCents: number } | undefined;
    if (!member) return { error: 'No se encontró el miembro.', status: 404 };
    if (member.cashCents < cents) return { error: 'No hay suficiente efectivo.', status: 400 };
    db.prepare('UPDATE members SET cash_cents=cash_cents-? WHERE id=?').run(cents, id);
    db.prepare(
      "INSERT INTO transactions (member_id,kind,amount_cents,note) VALUES (?,'cash_out',?,?)",
    ).run(id, -cents, note);
    return { cashCents: member.cashCents - cents };
  })();
  if ('error' in result)
    return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, cashCents: result.cashCents });
}
