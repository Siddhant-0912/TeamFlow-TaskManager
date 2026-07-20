import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';
import { getErrorMessage } from '@/lib/api-helper';

export async function GET() {
  try {
    await connectDB();
    const user = await requireRole('admin');
    if (!user) {
      return NextResponse.json({ error: 'Only administrators can view team members' }, { status: 403 });
    }

    const users = await User.find({}, 'name email role avatarInitials');
    return NextResponse.json(users);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
