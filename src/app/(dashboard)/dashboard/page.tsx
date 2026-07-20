'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DatabaseZap,
  Folder,
  Plus,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Project {
  _id: string;
  title: string;
  description: string;
  adminId: { name: string };
  members: string[];
  taskCount: number;
  createdAt: string;
}

interface Stats {
  totalTasks: number;
  statusCounts: {
    todo: number;
    inProgress: number;
    done: number;
  };
  overdueTasks: number;
  recentTasks: {
    _id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    projectId: { title: string };
    assignedTo?: { name: string };
  }[];
  tasksPerUser: { name: string; count: number }[];
}

interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

const statStyles = {
  total: {
    label: 'Total Tasks',
    tint: 'from-blue-50 to-white',
    icon: Target,
    accent: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  completed: {
    label: 'Completed',
    tint: 'from-emerald-50 to-white',
    icon: CheckCircle2,
    accent: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  progress: {
    label: 'In Progress',
    tint: 'from-amber-50 to-white',
    icon: Clock,
    accent: 'text-amber-600',
    ring: 'ring-amber-100',
  },
  overdue: {
    label: 'Overdue',
    tint: 'from-red-50 to-white',
    icon: AlertCircle,
    accent: 'text-red-600',
    ring: 'ring-red-100',
  },
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

function formatRelativeDate(date: string) {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return 'Recently updated';

  const diffDays = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  return `Updated ${diffDays} days ago`;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchProjects(), fetchStats(), fetchUser()]);
    setLoading(false);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok) setCurrentUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (res.ok) setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completion = stats?.totalTasks ? Math.round((stats.statusCounts.done / stats.totalTasks) * 100) : 0;

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { key: 'total', value: stats.totalTasks, helper: `${projects.length} active projects` },
      { key: 'completed', value: stats.statusCounts.done, helper: `${completion}% workspace progress` },
      { key: 'progress', value: stats.statusCounts.inProgress, helper: 'Moving this week' },
      { key: 'overdue', value: stats.overdueTasks, helper: stats.overdueTasks ? 'Needs attention' : 'No blockers' },
    ] as const;
  }, [completion, projects.length, stats]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        setNewProject({ title: '', description: '' });
        setIsDialogOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Reset the demo workspace? This will replace all current users, projects, and tasks.')) return;

    setResettingDemo(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        await fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to reset demo data');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reset demo data');
    } finally {
      setResettingDemo(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/50 dark:border-slate-700/60 dark:shadow-black/40 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-100 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" />
              {currentUser?.role || 'member'} workspace
            </div>
            <div className="ml-2 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-emerald-300/20">
              <DatabaseZap className="h-3.5 w-3.5" />
              Demo Workspace Loaded
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl">
                Good to see you{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                A focused command center for projects, assignments, and team momentum.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full border-white/10 bg-white/10 pl-10 text-white placeholder:text-slate-400 focus-visible:bg-white/15 sm:w-72"
              />
            </div>

            {currentUser?.role === 'admin' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                  disabled={resettingDemo}
                  onClick={handleResetDemoData}
                >
                  <DatabaseZap className="mr-2 h-4 w-4" />
                  {resettingDemo ? 'Resetting...' : 'Reset Demo Data'}
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger render={<Button className="h-11 bg-white text-slate-950 hover:bg-slate-100" />}>
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Create New Project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-5 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-bold">Project Title</Label>
                        <Input
                          id="title"
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          placeholder="e.g. Website Redesign"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-bold">Description</Label>
                        <Textarea
                          id="description"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Briefly describe the project goals..."
                          className="min-h-32 rounded-xl border-slate-200 bg-white/80 focus-visible:ring-primary/10"
                        />
                      </div>
                      <Button type="submit" className="w-full">Create Project</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="flex min-h-28 flex-col justify-between rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
            <p className="text-xs font-semibold text-slate-400">Workspace progress</p>
            <p className="text-3xl font-black tracking-tight">{completion}%</p>
          </div>
          <div className="flex min-h-28 flex-col justify-between rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
            <p className="text-xs font-semibold text-slate-400">Assigned workload</p>
            <p className="text-3xl font-black tracking-tight">{stats?.tasksPerUser.length || 0}</p>
          </div>
          <div className="flex min-h-28 flex-col justify-between rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
            <p className="text-xs font-semibold text-slate-400">Recent updates</p>
            <p className="text-3xl font-black tracking-tight">{stats?.recentTasks.length || 0}</p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white/80 shadow-sm" />)
          : statCards.map((stat, index) => {
              const style = statStyles[stat.key];
              const Icon = style.icon;
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn('h-full bg-gradient-to-br transition-all duration-300 hover:-translate-y-1 hover:shadow-xl', style.tint)}>
                    <CardContent className="flex min-h-36 flex-col justify-between p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{style.label}</p>
                          <motion.p
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50"
                          >
                            {stat.value}
                          </motion.p>
                        </div>
                        <div className={cn('rounded-2xl bg-white p-3 shadow-sm ring-1', style.ring)}>
                          <Icon className={cn('h-5 w-5', style.accent)} />
                        </div>
                      </div>
                      <p className="mt-5 text-sm font-medium text-slate-500">{stat.helper}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="premium-label">Projects</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">Active workspaces</h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
              {filteredProjects.length} found
            </span>
          </div>

          {loading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-white" />)}
            </div>
          ) : filteredProjects.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredProjects.map((project, index) => {
                const progress = project.taskCount ? Math.min(96, 28 + ((index * 17 + project.taskCount * 9) % 68)) : 0;
                const overdue = stats?.overdueTasks && index === 0 ? stats.overdueTasks : 0;

                return (
                  <Link key={project._id} href={`/projects/${project._id}`} className="group block">
                    <motion.article
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 dark:border-slate-800 dark:bg-[#1D2130] dark:hover:border-indigo-400/40 dark:hover:shadow-black/30"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 ring-1 ring-indigo-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                            <Folder className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="line-clamp-1 text-lg font-black text-slate-950 dark:text-slate-50">{project.title}</h3>
                            <p className="text-xs font-medium text-slate-400">{formatRelativeDate(project.createdAt)}</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-500" />
                      </div>

                      <p className="mt-5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {project.description || 'No description yet. Add context so everyone can move faster.'}
                      </p>

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex -space-x-2">
                          {project.members.slice(0, 4).map((member, memberIndex) => (
                            <div
                              key={`${project._id}-${memberIndex}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-[10px] font-bold text-white shadow-sm"
                            >
                              {memberIndex + 1}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            <Target className="h-3.5 w-3.5" />
                            {project.taskCount || 0} tasks
                          </span>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                            overdue ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          )}>
                            <AlertCircle className="h-3.5 w-3.5" />
                            {overdue || 'Clear'}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-indigo-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Folder className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-slate-50">Create your first project to start collaborating</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Projects keep tasks, members, and progress together so your team always knows what matters.
              </p>
              {currentUser?.role === 'admin' && (
                <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <Card className="bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Insight</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-slate-50">Workspace Progress</h2>
                </div>
                <Activity className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">{completion}% of tracked work is complete.</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-5">
              <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">Team Workload</h2>
              <div className="mt-5 space-y-4">
                {stats?.tasksPerUser.length ? stats.tasksPerUser.map((user) => (
                  <div key={user.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white">
                          {initials(user.name)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{user.name}</span>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-black text-indigo-600">{user.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(user.count / (stats.totalTasks || 1)) * 100}%` }} />
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-[#171923] dark:text-slate-300">No active assignments yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-5">
              <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">Recent Activity</h2>
              <div className="mt-4 space-y-1">
                {stats?.recentTasks.length ? stats.recentTasks.map((task) => (
                  <div key={task._id} className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50">
                    <span className={cn(
                      'mt-1 h-2.5 w-2.5 rounded-full',
                      task.status === 'done' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-300'
                    )} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{task.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{task.projectId.title} · {task.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500 dark:bg-[#171923] dark:text-slate-300">No recent updates</div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
