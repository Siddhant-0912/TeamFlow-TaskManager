import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const decoded = await getAuthUser();
    if (!decoded) return ApiResponse.unauthorized();

    const projects = await Project.find({
      $or: [
        { adminId: decoded.userId },
        { members: decoded.userId },
      ],
    })
      .populate('adminId', 'name email')
      .lean();

    const projectsWithCounts = await Promise.all(
      projects.map(async (project: { _id: unknown }) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        return { ...project, taskCount };
      })
    );

    return ApiResponse.success(projectsWithCounts);
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const decoded = await getAuthUser();
    if (!decoded) return ApiResponse.unauthorized();

    const user = await requireRole('admin');
    if (!user) {
      return ApiResponse.forbidden('Only administrators can create projects');
    }

    const { title, description } = await req.json();
    const project = await Project.create({
      title,
      description,
      adminId: user._id,
      members: [user._id],
    });

    return ApiResponse.success(project);
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
