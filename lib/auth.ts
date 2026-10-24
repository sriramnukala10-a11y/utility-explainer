import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthSession, Role } from './types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'utility-explainer-fallback-development-secret-key-32chars!';
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'utility_session_token';

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function createSessionToken(session: AuthSession): string {
  return jwt.sign(
    {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      phone: session.phone || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySessionToken(token: string): AuthSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.userId || !decoded.email || !decoded.role) {
      return null;
    }
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role as Role,
      phone: decoded.phone,
    };
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the session from server-side cookies
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Helper to enforce customer ownership or admin elevation
 */
export function canAccessUserRecord(session: AuthSession, targetUserId: string): boolean {
  if (session.role === 'ADMIN' || session.role === 'TECHNICIAN') {
    return true;
  }
  return session.userId === targetUserId;
}

export function assertAdmin(session: AuthSession | null): void {
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Administrative role required');
  }
}
