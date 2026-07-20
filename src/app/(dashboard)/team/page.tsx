'use client';

import { useState, useEffect } from 'react';
import { Mail, Shield, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.error || 'You do not have access to team management');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-[#1D2130] dark:shadow-black/30 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">Team</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">Team Members</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">View and manage your organization&apos;s members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))
        ) : error ? (
          <Card className="border-slate-200 md:col-span-2 lg:col-span-3">
            <CardContent className="p-8 text-center text-slate-500">
              {error}
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user._id} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-black text-white">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-slate-950 dark:text-slate-50">{user.name}</h2>
                    <Badge className="mt-2 rounded-full bg-indigo-50 text-[10px] font-black uppercase tracking-wide text-indigo-600">
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role || 'Member'}
                    </Badge>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-[#171923] dark:text-slate-300">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
