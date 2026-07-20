'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, CheckCircle2, Circle, Clock, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Project {
  _id: string;
  title: string;
  description: string;
  adminId: { _id: string; name: string };
  members: { _id: string; name: string; email: string }[];
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo?: { _id: string; name: string };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

const statusMap = {
  todo: { label: 'To Do', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Circle },
  'in-progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-600 border-blue-100', icon: Clock },
  done: { label: 'Done', className: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
};

const priorityMap = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

function isOverdue(dueDate: string, status: Task['status']) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate).getTime() < Date.now();
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: 'admin' | 'member' } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });

  const fetchMe = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (res.ok) {
      setCurrentUser({ id: data.user._id, role: data.user.role });
      if (data.user.role === 'admin') fetchUsers();
    }
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (res.ok) setProject(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProject();
    fetchTasks();
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, projectId }),
      });
      if (res.ok) {
        setIsTaskDialogOpen(false);
        setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '' });
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const inviteMember = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      if (res.ok) {
        setIsMemberDialogOpen(false);
        setSelectedUserId('');
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(taskSearchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const taskStats = useMemo(() => {
    const done = tasks.filter((task) => task.status === 'done').length;
    const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
    const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.status)).length;
    const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return { done, inProgress, overdue, progress };
  }, [tasks]);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-10">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-[#1D2130] dark:shadow-black/30 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 dark:text-indigo-300 dark:ring-indigo-400/20">Project</Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-500">
                {project?.members.length || 0} members
              </Badge>
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950 dark:text-slate-50 sm:text-4xl">{project?.title || 'Project'}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {project?.description || 'Track and manage project deliverables with clarity.'}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                <DialogTrigger render={<Button variant="outline" />}>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <Label>Search by Email or Name</Label>
                      <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Select Member</Label>
                      <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value ?? '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredUsers.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                          {filteredUsers.length === 0 && <div className="p-3 text-center text-sm text-slate-500">No users found</div>}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={inviteMember} disabled={!selectedUserId}>Add to Project</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger render={<Button />}>
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input id="task-title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. Design Homepage" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-desc">Description</Label>
                      <Textarea id="task-desc" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="What needs to be done?" className="min-h-28 rounded-xl border-slate-200 bg-white/80" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={newTask.priority} onValueChange={(value) => value && setNewTask({ ...newTask, priority: value as TaskPriority })}>
                          <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value ?? '' })}>
                        <SelectTrigger><SelectValue placeholder="Select Team Member" /></SelectTrigger>
                        <SelectContent>
                          {users.map((user) => <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Create Task</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            ['Total tasks', tasks.length],
            ['Completed', taskStats.done],
            ['In progress', taskStats.inProgress],
            ['Overdue', taskStats.overdue],
          ].map(([label, value]) => (
            <div key={label} className="flex min-h-28 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-[#171923]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
              <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{value}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <main className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-[#1D2130]/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-[#171923]">
              {(['tasks', 'members'] as const).map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-bold capitalize transition-all',
                    activeTab === tab ? 'bg-white text-slate-950 shadow-sm dark:bg-indigo-500 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'tasks' && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Search tasks..." value={taskSearchQuery} onChange={(e) => setTaskSearchQuery(e.target.value)} className="pl-10 sm:w-64" />
                </div>
                <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value as TaskStatus | 'all')}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white sm:w-36 dark:border-slate-700 dark:bg-[#171923]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {activeTab === 'tasks' ? (
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)
              ) : filteredTasks.length ? (
                filteredTasks.map((task, index) => {
                  const status = statusMap[task.status];
                  const StatusIcon = status.icon;
                  const canUpdate = Boolean(isAdmin || (currentUser && task.assignedTo?._id === currentUser.id));
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <motion.div key={task._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                      <Card className={cn('relative transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl', task.status === 'done' && 'bg-slate-50/80 dark:bg-[#171923]/80')}>
                        <div className={cn('absolute inset-y-0 left-0 w-1.5', priorityMap[task.priority])} />
                        <CardContent className="p-5 pl-6">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                              <button
                                onClick={() => canUpdate && updateTaskStatus(task._id, task.status === 'done' ? 'todo' : 'done')}
                                disabled={!canUpdate}
                                className={cn('mt-1 rounded-full transition-transform hover:scale-110', !canUpdate && 'cursor-default opacity-60')}
                              >
                                <StatusIcon className={cn('h-5 w-5', task.status === 'done' ? 'text-emerald-500' : task.status === 'in-progress' ? 'text-blue-500' : 'text-slate-300')} />
                              </button>
                              <div className="min-w-0">
                                <h3 className={cn('text-base font-black text-slate-950 dark:text-slate-50', task.status === 'done' && 'text-slate-400 line-through dark:text-slate-500')}>{task.title}</h3>
                                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">{task.description || 'No description added.'}</p>
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', status.className)}>
                                    {status.label}
                                  </Badge>
                                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-2.5 py-1 text-xs font-bold uppercase text-slate-500">
                                    <span className={cn('mr-1.5 h-2 w-2 rounded-full', priorityMap[task.priority])} />
                                    {task.priority}
                                  </Badge>
                                  {task.dueDate && (
                                    <Badge variant="outline" className={cn('rounded-full px-2.5 py-1 text-xs font-bold', overdue ? 'border-red-100 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-[#171923]')}>
                                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Badge>
                                  )}
                                  {task.assignedTo && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[9px] text-white">{initials(task.assignedTo.name)}</span>
                                      {task.assignedTo.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {canUpdate ? (
                                <Select value={task.status} onValueChange={(value) => value && updateTaskStatus(task._id, value)}>
                                  <SelectTrigger className="h-9 rounded-xl border-slate-200 bg-white text-xs font-bold lg:w-36 dark:border-slate-700 dark:bg-[#171923]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : null}
                              {isAdmin && (
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={() => deleteTask(task._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-[2rem] border border-dashed border-indigo-200 bg-white p-10 text-center shadow-sm dark:border-indigo-500/30 dark:bg-[#1D2130]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:text-indigo-300">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-slate-50">No tasks assigned yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Create a first task or adjust your filters to see more work.</p>
                  {isAdmin && <Button className="mt-6" onClick={() => setIsTaskDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Task</Button>}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {project?.members.map((member) => (
                <Card key={member._id} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                        {initials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate font-black text-slate-950 dark:text-slate-50">{member.name}</h4>
                          {member._id === project.adminId._id && <Badge className="rounded-full bg-indigo-50 text-indigo-600">Creator</Badge>}
                        </div>
                        <p className="truncate text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    {isAdmin && member._id !== currentUser?.id && (
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={() => removeMember(member._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <aside className="space-y-5">
          <Card className="bg-slate-950 text-white">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Project Progress</p>
              <p className="mt-3 text-4xl font-black">{taskStats.progress}%</p>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-300" style={{ width: `${taskStats.progress}%` }} />
              </div>
              <p className="mt-4 text-sm text-slate-300">{taskStats.done} of {tasks.length} tasks completed.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-slate-50"><Users className="h-5 w-5 text-indigo-500" /> Collaborators</h2>
              <div className="mt-4 flex -space-x-2">
                {project?.members.slice(0, 8).map((member) => (
                  <div key={member._id} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-xs font-bold text-white shadow-sm">
                    {initials(member.name)}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500">{project?.members.length || 0} people can access this project.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">Upcoming deadlines</h2>
              <div className="mt-4 space-y-2">
                {tasks.filter((task) => task.dueDate && task.status !== 'done').slice(0, 4).map((task) => (
                  <div key={task._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-[#171923]">
                    <span className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{task.title}</span>
                    <span className="text-xs font-bold text-slate-400">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
                {!tasks.filter((task) => task.dueDate && task.status !== 'done').length && (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-[#171923] dark:text-slate-300">No upcoming deadlines</div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
