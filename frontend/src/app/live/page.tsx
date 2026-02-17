'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { liveAPI } from '@/lib/api';
import { Radio, Eye, Play, AlertCircle } from 'lucide-react';

export default function LivePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startTitle, setStartTitle] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
    const iv = setInterval(loadSessions, 10000);
    return () => clearInterval(iv);
  }, []);

  const loadSessions = () => {
    liveAPI.getActive().then(({ data }) => setSessions(data)).catch(console.error).finally(() => setLoading(false));
  };

  const startSession = async () => {
    if (!startTitle.trim()) return;
    setStarting(true); setError('');
    try {
      const { data } = await liveAPI.start(startTitle);
      router.push(`/live/${data.id}`);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setStarting(false); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Radio className="w-6 h-6 text-red-500 animate-pulse" />
          <h1 className="text-2xl font-bold">Live Sessions</h1>
        </div>
        {isAuthenticated && user?.role === 'ARTIST' && (
          <div className="card p-6 mb-8">
            <h2 className="font-semibold mb-4">Start a Live Session</h2>
            {error && <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
            <div className="flex gap-3">
              <input type="text" value={startTitle} onChange={(e) => setStartTitle(e.target.value)} className="input-field flex-1" placeholder="Session title..." />
              <button onClick={startSession} disabled={starting || !startTitle.trim()} className="btn-primary">{starting ? 'Starting...' : 'Go Live'}</button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="card p-6 animate-pulse"><div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" /></div>)}</div>
        ) : sessions.length === 0 ? (
          <div className="card p-12 text-center"><Radio className="w-12 h-12 mx-auto mb-4 text-gray-400" /><h3 className="text-lg font-semibold mb-2">No live sessions</h3><p className="text-gray-500">Check back later!</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((s) => (
              <Link key={s.id} href={`/live/${s.id}`} className="card hover:border-violet-500 transition-all group">
                <div className="relative h-40 bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100" />
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE</div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-xs rounded-full"><Eye className="w-3 h-3" /> {s.viewers}</div>
                </div>
                <div className="p-4"><h3 className="font-semibold">{s.title}</h3><p className="text-sm text-gray-500 mt-1">{s.artist?.user?.username}</p></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
