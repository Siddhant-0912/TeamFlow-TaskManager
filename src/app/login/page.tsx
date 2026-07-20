'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Failed to login');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alex.johnson@teamflow.demo',
          password: 'DemoPass123!',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Failed to enter demo workspace');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground transition-colors">
      <Card className="w-full max-w-md rounded-[2rem] border-white/80 shadow-2xl shadow-slate-300/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl font-black tracking-tight">Login</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter your email and password to access your workspace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-500">{error}</div>}
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-slate-50/70">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={handleDemoLogin}>
              <Sparkles className="mr-2 h-4 w-4" />
              Enter Demo Workspace
            </Button>
            <div className="text-sm text-center text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
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
