import { ApiResponse, getErrorMessage } from '@/lib/api-helper';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return ApiResponse.unauthorized();

    // Get projects where user is member or admin
    const projects = await Project.find({
      $or: [
        { adminId: user.userId },
        { members: user.userId }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // 1. Total Tasks
    const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });

    // 2. Tasks By Status
    const todoTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'in-progress' });
    const doneTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'done' });

    // 3. Overdue Tasks (dueDate < now and status !== done)
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: now }
    });

    // 4. Recent Tasks
    const recentTasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('projectId', 'title')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Tasks Per User
    const tasksPerUser = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    return ApiResponse.success({
      totalTasks,
      statusCounts: {
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks
      },
      overdueTasks,
      recentTasks,
      tasksPerUser
    });
  } catch (error: unknown) {
    return ApiResponse.serverError(getErrorMessage(error));
  }
}
