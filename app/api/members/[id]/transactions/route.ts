import { NextResponse } from 'next/server';
import db from '@/lib/db';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transactions = db
    .prepare(
      'SELECT t.id,t.kind,t.amount_cents AS amountCents,t.note,t.created_at AS createdAt, k.title AS taskTitle FROM transactions t LEFT JOIN tasks k ON k.id=t.task_id WHERE t.member_id=? ORDER BY t.id DESC',
    )
    .all(id);
  return NextResponse.json(transactions);
}
