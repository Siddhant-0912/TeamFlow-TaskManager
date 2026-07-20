import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import User from '@/models/User';

export type UserRole = 'admin' | 'member';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function comparePasswords(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed);
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded;
}

export async function getCurrentUser() {
  const decoded = await getAuthUser();
  if (!decoded) return null;

  const user = await User.findById(decoded.userId).select('-password');
  return user || null;
}

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  if (!user || user.role !== role) return null;

  return user;
}
