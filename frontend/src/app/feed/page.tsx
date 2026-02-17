'use client';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { feedAPI, videosAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Play, Eye, Heart, Music, TrendingUp } from 'lucide-react';

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => { feedAPI.get().then(({ data }) => setFeed(data.feed || [])).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleLike = async (id: string) => {
    if (!isAuthenticated) return;
    try { await videosAPI.like(id); setFeed((prev) => prev.map((item) => item.id === id && item.type === 'video' ? { ...item, likes: (item.likes || 0) + 1 } : item)); } catch {}
  };

  return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8"><TrendingUp className="w-6 h-6 text-violet-500" /><h1 className="text-2xl font-bold">Your Feed</h1></div>
        {loading ? <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="card p-6 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" /><div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" /></div>)}</div>
        : feed.length === 0 ? <div className="card p-12 text-center"><Music className="w-12 h-12 mx-auto mb-4 text-gray-400" /><h3 className="text-lg font-semibold mb-2">No content yet</h3><p className="text-gray-500">Be the first to upload!</p></div>
        : <div className="space-y-6">{feed.map((item, idx) => (
          <div key={`${item.type}-${item.id}-${idx}`} className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                {(item.type === 'video' ? item.user?.username : item.artist?.user?.username || '?')[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{item.type === 'video' ? item.user?.username : item.artist?.user?.username}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'video' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                  {item.type === 'video' ? 'Video' : 'Track'}
                </span>
              </div>
            </div>
            <div className="p-4">
              {item.type === 'video' ? (
                <>
                  <p className="text-sm mb-3">{item.caption}</p>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48 flex items-center justify-center"><Play className="w-12 h-12 text-gray-400" /></div>
                  <div className="flex items-center gap-4 mt-3">
                    <button onClick={() => handleLike(item.id)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"><Heart className="w-4 h-4" /> {item.likes || 0}</button>
                    <span className="flex items-center gap-1 text-sm text-gray-500"><Eye className="w-4 h-4" /> {item.views || 0}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0"><Music className="w-8 h-8 text-white" /></div>
                  <div className="flex-1 min-w-0"><h3 className="font-semibold truncate">{item.title}</h3><p className="text-sm text-gray-500">{item.plays || 0} plays</p></div>
                  <button className="p-3 rounded-full bg-violet-600 text-white hover:bg-violet-700"><Play className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}
