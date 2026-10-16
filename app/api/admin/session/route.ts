import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
export async function GET(req: Request) {
  return NextResponse.json({ authorized: await isAdminAuthorized(req) });
}
