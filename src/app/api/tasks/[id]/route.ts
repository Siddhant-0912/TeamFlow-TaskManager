import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getAuthUser, getCurrentUser, requireRole } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const decoded = await getAuthUser();
    if (!decoded) return ApiResponse.unauthorized();

    const { id } = await params;
    const updates = await req.json();

    const task = await Task.findById(id);
    if (!task) return ApiResponse.notFound('Task not found');

    const project = await Project.findById(task.projectId);
    if (!project) return ApiResponse.notFound('Project not found');

    const user = await getCurrentUser();
    if (!user) return ApiResponse.unauthorized();

    const isAdmin = user.role === 'admin';
    const isAssigned = task.assignedTo?.toString() === decoded.userId;

    // Members can only update status of tasks assigned to them
    if (!isAdmin && !isAssigned) {
      return ApiResponse.forbidden('You are not authorized to update this task');
    }

    // If not admin, only allow status update
    if (!isAdmin && isAssigned) {
      const allowedUpdates = ['status'];
      const actualUpdates = Object.keys(updates);
      const isStatusOnly = actualUpdates.every(u => allowedUpdates.includes(u));
      if (!isStatusOnly) {
        return ApiResponse.forbidden('Members can only update the status of assigned tasks');
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true }).populate('assignedTo', 'name email');
    return ApiResponse.success(updatedTask);
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
      return ApiResponse.forbidden('Only administrators can delete tasks');
    }

    const { id } = await params;
    const task = await Task.findById(id);
    if (!task) return ApiResponse.notFound('Task not found');

    await Task.findByIdAndDelete(id);
    return ApiResponse.success({ message: 'Task deleted' });
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
