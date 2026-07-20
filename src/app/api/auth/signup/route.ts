import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { signupSchema } from '@/lib/validations';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate with Zod — includes role validation
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return ApiResponse.error(result.error.issues[0].message);
    }

    const { name, email, password, role } = result.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id.toString());
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return ApiResponse.success({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
