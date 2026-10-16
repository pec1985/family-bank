import { NextResponse } from 'next/server';
import db from '@/lib/db';
export async function GET() {
  return NextResponse.json(
    db
      .prepare(
        'SELECT id,title,description,amount_cents AS amountCents,icon FROM tasks ORDER BY id',
      )
      .all(),
  );
}
