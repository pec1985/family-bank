import { validAuthCookie } from '@/lib/auth-cookies';

export async function isParentAuthorized(request: Request) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('family-bank-parent='))
    ?.slice('family-bank-parent='.length);
  return validAuthCookie(cookie, 'parent');
}
