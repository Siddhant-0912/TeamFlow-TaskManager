import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const decoded = await getAuthUser();
    if (!decoded) return ApiResponse.unauthorized();

    const { id } = await params;
    const project = await Project.findById(id)
      .populate('adminId', 'name email')
      .populate('members', 'name email');
    
    if (!project) return ApiResponse.notFound('Project not found');

    const isMember = project.members.some((m: { _id: { toString(): string } }) => m._id.toString() === decoded.userId);
    const isAdmin = project.adminId._id.toString() === decoded.userId;

    if (!isMember && !isAdmin) return ApiResponse.forbidden();

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
      return ApiResponse.forbidden('Only administrators can delete projects');
    }

    const { id } = await params;
    const project = await Project.findById(id);
    
    if (!project) return ApiResponse.notFound('Project not found');

    if (project.adminId.toString() !== user._id.toString()) {
      return ApiResponse.forbidden('You can only delete your own projects');
    }

    await Project.findByIdAndDelete(id);
    await Task.deleteMany({ projectId: id });

    return ApiResponse.success({ message: 'Project deleted' });
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
