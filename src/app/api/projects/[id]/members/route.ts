import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const decoded = await getAuthUser();
    if (!decoded) return ApiResponse.unauthorized();

    const user = await requireRole('admin');
    if (!user) {
      return ApiResponse.forbidden('Only administrators can manage members');
    }

    const { id } = await params;
    const { userId } = await req.json();
    const member = await User.findById(userId);
    if (!member) return ApiResponse.notFound('User not found');

    const project = await Project.findById(id);
    if (!project) return ApiResponse.notFound('Project not found');

    if (project.adminId.toString() !== user._id.toString()) {
      return ApiResponse.forbidden('Only the project admin can manage its members');
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    return ApiResponse.success(project);
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const decoded = await getAuthUser();
    if (!decoded) return ApiResponse.unauthorized();

    const user = await requireRole('admin');
    if (!user) {
      return ApiResponse.forbidden('Only administrators can manage members');
    }

    const { id } = await params;
    const { userId } = await req.json();

    const project = await Project.findById(id);
    if (!project) return ApiResponse.notFound('Project not found');

    if (project.adminId.toString() !== user._id.toString()) {
      return ApiResponse.forbidden('Only the project admin can manage its members');
    }

    project.members = project.members.filter((m: { toString(): string }) => m.toString() !== userId);
    await project.save();

    return ApiResponse.success(project);
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
