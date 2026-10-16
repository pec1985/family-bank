import { NextResponse } from 'next/server';
import db from '@/lib/db';
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { amount, investmentId } = await req.json();
  const cents = Math.round(Number(amount) * 100);
  const multiplierSetting = db
    .prepare("SELECT value FROM app_settings WHERE key='investment_multiplier'")
    .get() as { value: string } | undefined;
  const multiplier = Number(multiplierSetting?.value ?? 2);
  if (!Number.isInteger(cents) || cents < 1)
    return NextResponse.json({ error: 'Indica una cantidad válida' }, { status: 400 });
  if (!Number.isInteger(Number(investmentId)))
    return NextResponse.json({ error: 'Elige una meta de inversión' }, { status: 400 });
  const move = db.transaction(() => {
    const member = db.prepare('SELECT cash_cents AS cash FROM members WHERE id=?').get(id) as
      { cash: number } | undefined;
    const goal = db
      .prepare('SELECT name FROM investments WHERE id=? AND member_id=?')
      .get(investmentId, id) as { name: string } | undefined;
    if (!member || !goal || member.cash < cents) return false;
    db.prepare(
      'UPDATE members SET cash_cents=cash_cents-?, investment_cents=investment_cents+? WHERE id=?',
    ).run(cents, cents * multiplier, id);
    db.prepare('UPDATE investments SET balance_cents=balance_cents+? WHERE id=?').run(
      cents * multiplier,
      investmentId,
    );
    db.prepare(
      "INSERT INTO transactions (member_id,kind,amount_cents,note) VALUES (?,'invest',?,?)",
    ).run(id, cents * multiplier, `Inversión: ${goal.name}`);
    return true;
  });
  if (!move()) return NextResponse.json({ error: 'No hay suficiente efectivo' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
