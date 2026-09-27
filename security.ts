import { cookies, headers } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { env } from './env';

const secret = new TextEncoder().encode(env.ADMIN_JWT_SECRET);
const COOKIE = 'lyrosc_admin';

export async function createAdminToken() {
  return new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h').sign(secret);
}

export async function isAdmin() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return false;
  try { const { payload } = await jwtVerify(token, secret); return payload.role === 'admin'; } catch { return false; }
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('UNAUTHORIZED');
}

export function setAdminCookie(token: string) {
  cookies().set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
}

export function clearAdminCookie() { cookies().delete(COOKIE); }

export function sameOrigin() {
  const origin = headers().get('origin');
  if (!origin) return true;
  return origin === env.NEXT_PUBLIC_SITE_URL;
}
