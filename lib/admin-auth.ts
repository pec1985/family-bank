import { validAuthCookie } from '@/lib/auth-cookies';

export async function isAdminAuthorized(request: Request) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('family-bank-admin='))
    ?.slice('family-bank-admin='.length);
  return validAuthCookie(cookie, 'admin');
}
