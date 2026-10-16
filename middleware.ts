import { NextRequest, NextResponse } from 'next/server';
import { validAuthCookie } from '@/lib/auth-cookies';
export async function middleware(request: NextRequest) {
  if (await validAuthCookie(request.cookies.get('family-bank-session')?.value, 'session'))
    return NextResponse.next();
  return NextResponse.json({ error: 'Inicia sesión para continuar' }, { status: 401 });
}
export const config = { matcher: ['/api/((?!login|deploy|health).*)'] };
