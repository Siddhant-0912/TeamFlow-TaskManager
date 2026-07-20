import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const decoded = await getAuthUser();

    if (!decoded) {
      return ApiResponse.unauthorized();
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    return ApiResponse.success({ user });
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
