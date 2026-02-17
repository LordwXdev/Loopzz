'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Music, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); router.push('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center"><Music className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">Loopzz</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
        </div>
        <div className="card p-6">
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1.5">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
        </div>
        <p className="text-center mt-4 text-sm text-gray-500">No account? <Link href="/auth/register" className="text-violet-500 font-medium hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
