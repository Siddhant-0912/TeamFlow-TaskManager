export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatarInitials?: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  adminId: string | User;
  members: (string | User)[];
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assignedTo?: string | User;
  projectId: string | Project;
  createdBy: string | User;
  createdAt: string;
}
