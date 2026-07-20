import { cookies } from 'next/headers';
import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import { generateToken, requireRole } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { seedDemoData } from '@/lib/seed/seedDemoData';

export async function POST() {
  try {
    await connectDB();
    const user = await requireRole('admin');
    if (!user) return ApiResponse.forbidden('Only administrators can reset demo data');

    const result = await seedDemoData({ reset: true });

    if (result.seeded && result.adminId) {
      const token = generateToken(result.adminId);
      const cookieStore = await cookies();
      cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return ApiResponse.success(result);
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
