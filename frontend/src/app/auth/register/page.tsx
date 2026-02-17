'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Music, AlertCircle } from 'lucide-react';

function RegisterForm() {
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register({ ...form, referralCode }); router.push('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
      <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
      <div><label className="block text-sm font-medium mb-1.5">Username</label><input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field" required minLength={3} /></div>
      <div><label className="block text-sm font-medium mb-1.5">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required minLength={6} /></div>
      <div>
        <label className="block text-sm font-medium mb-3">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          {['USER', 'ARTIST'].map((role) => (
            <button key={role} type="button" onClick={() => setForm({ ...form, role })}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${form.role === role ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-gray-200 dark:border-gray-700'}`}>
              {role === 'USER' ? '🎧 Fan' : '🎤 Artist'}
            </button>
          ))}
        </div>
      </div>
      {referralCode && <p className="text-xs text-green-600 dark:text-green-400">Referred by a friend!</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Creating...' : 'Create account'}</button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center"><Music className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">Loopzz</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
        </div>
        <div className="card p-6"><Suspense fallback={<div>Loading...</div>}><RegisterForm /></Suspense></div>
        <p className="text-center mt-4 text-sm text-gray-500">Already have an account? <Link href="/auth/login" className="text-violet-500 font-medium hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
