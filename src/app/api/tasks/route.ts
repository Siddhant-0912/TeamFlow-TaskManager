import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return ApiResponse.unauthorized();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) return ApiResponse.error('Project ID is required');

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { adminId: user.userId },
        { members: user.userId },
      ],
    });

    if (!project) return ApiResponse.forbidden('You do not have access to this project');

    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return ApiResponse.success(tasks);
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return ApiResponse.unauthorized();

    const body = await req.json();
    const userRecord = await requireRole('admin');
    if (!userRecord) {
      return ApiResponse.forbidden('Only administrators can create tasks');
    }

    const project = await Project.findById(body.projectId);
    if (!project) return ApiResponse.notFound('Project not found');

    const task = await Task.create({
      ...body,
      createdBy: userRecord._id,
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');
    return ApiResponse.success(populatedTask);
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
