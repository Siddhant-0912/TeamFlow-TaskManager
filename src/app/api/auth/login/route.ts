import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { comparePasswords, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate request body
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return ApiResponse.error(result.error.issues[0].message);
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email });
    if (!user) {
      return ApiResponse.error('Invalid credentials');
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return ApiResponse.error('Invalid credentials');
    }

    const token = generateToken(user._id.toString());
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return ApiResponse.success({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
