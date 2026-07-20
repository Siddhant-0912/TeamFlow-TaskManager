'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Failed to sign up');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground transition-colors">
      <Card className="w-full max-w-xl rounded-[2rem] border-white/80 shadow-2xl shadow-slate-300/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl font-black tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter your details to create your workspace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-500">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label>Account Type</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={cn(
                    "flex min-h-36 flex-col items-start rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
                    role === 'member' 
                      ? "border-indigo-300 bg-indigo-50/70 ring-2 ring-indigo-100" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <span className={cn("font-black text-base", role === 'member' ? "text-indigo-700" : "text-slate-900")}>Member</span>
                  <span className="text-xs text-slate-500 mt-1">Join projects, work on assigned tasks, and track progress.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={cn(
                    "flex min-h-36 flex-col items-start rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
                    role === 'admin' 
                      ? "border-indigo-300 bg-indigo-50/70 ring-2 ring-indigo-100" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <span className={cn("font-black text-base", role === 'admin' ? "text-indigo-700" : "text-slate-900")}>Admin</span>
                  <span className="text-xs text-slate-500 mt-1">Create and manage projects, assign members, manage all tasks.</span>
                </button>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-slate-50/70">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <div className="text-sm text-center text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
            <div className="w-full rounded-xl border border-slate-200/80 bg-slate-100/60 p-3 text-left">
              <p className="text-xs font-semibold tracking-wide text-slate-700">Explore TeamFlow your way</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 gap-1 border-slate-300 bg-white/70 text-[11px] text-slate-700">
                    <Compass className="h-3 w-3" />
                    Demo
                  </Badge>
                  <p className="text-xs text-slate-600">
                    Try Demo Workspace - instantly explore a fully populated team environment for recruiters or quick exploration.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 gap-1 border-slate-300 bg-white/70 text-[11px] text-slate-700">
                    <UserPlus className="h-3 w-3" />
                    Fresh Start
                  </Badge>
                  <p className="text-xs text-slate-600">
                    Start Fresh - create your own workspace and join as either Admin or Member.
                  </p>
                </div>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
