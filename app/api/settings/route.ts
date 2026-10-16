import { NextResponse } from 'next/server';
import db from '@/lib/db';
export async function GET() {
  const row = db
    .prepare("SELECT value FROM app_settings WHERE key='investment_multiplier'")
    .get() as { value: string } | undefined;
  return NextResponse.json({ investmentMultiplier: Number(row?.value ?? 2) });
}
