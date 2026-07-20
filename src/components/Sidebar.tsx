'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Users, Settings, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const menuItems = [
  { icon: LayoutDashboard, label: 'Workspace', href: '/dashboard' },
  { icon: Users, label: 'Team Members', href: '/team' },
];

const secondaryItems = [
  { icon: Settings, label: 'Settings', href: '#' },
  { icon: HelpCircle, label: 'Help Center', href: '#' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'member' | null>(null);
  const [name, setName] = useState('TeamFlow User');

  useEffect(() => {
    async function fetchCurrentUser() {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;

      const data = await res.json();
      setRole(data.user.role);
      setName(data.user.name);
    }

    fetchCurrentUser();
  }, []);

  const visibleMenuItems = menuItems.filter((item) => item.href !== '/team' || role === 'admin');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200/80 bg-white/85 text-slate-900 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-[#171923]/90 dark:text-slate-100 dark:shadow-black/30 md:flex md:flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 font-black text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950/40">
            TF
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">TeamFlow</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Productivity workspace</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-violet-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-indigo-600 shadow-sm dark:bg-[#1D2130] dark:text-indigo-300">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{name}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 ring-1 ring-indigo-100 dark:bg-[#1D2130]/80 dark:text-indigo-300 dark:ring-indigo-400/20">
              <Sparkles className="h-3 w-3" />
              {role || 'Member'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.22em] mb-3 dark:text-slate-500">
          Main Menu
        </p>
        <nav className="space-y-1">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                pathname === item.href 
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-300/70 dark:bg-indigo-500 dark:shadow-indigo-950/40" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-300"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 px-4 py-2">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.22em] mb-3 dark:text-slate-500">
          Support
        </p>
        <nav className="space-y-1">
          {secondaryItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <item.icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-300" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-2 border-t border-slate-200/80 p-4 dark:border-slate-800">
        <ThemeToggle />
        <Button 
          variant="ghost" 
          className="w-full justify-start rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout Session
        </Button>
      </div>
    </aside>
    <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-2xl shadow-slate-300/70 backdrop-blur dark:border-slate-700 dark:bg-[#171923]/90 dark:shadow-black/40 md:hidden">
      <nav className="flex items-center justify-around gap-1">
        {visibleMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold transition-all",
              pathname === item.href ? "bg-slate-950 text-white dark:bg-indigo-500" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate">{item.label.replace('Team Members', 'Team')}</span>
          </Link>
        ))}
        <ThemeToggle compact />
        <button
          onClick={handleLogout}
          className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-500 transition-all hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
    </>
  );
}
