'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { transactionsAPI, referralsAPI, videosAPI, liveAPI } from '@/lib/api';
import { DollarSign, Users, Video, Eye, Radio, Copy, Check } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [earnings, setEarnings] = useState<any>(null);
  const [referrals, setReferrals] = useState<any>(null);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isAuthenticated || !user) return;

    Promise.allSettled([
      transactionsAPI.getEarnings(),
      referralsAPI.getMy(),
      videosAPI.getByUser(user.id),
    ]).then(([e, r, v]) => {
      if (e.status === 'fulfilled') setEarnings(e.value.data);
      if (r.status === 'fulfilled') setReferrals(r.value.data);
      if (v.status === 'fulfilled') setMyVideos(v.value.data);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, isLoading]);

  const copyReferral = () => {
    const url = `${window.location.origin}/auth/register?ref=${user?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-800 rounded w-48" />
        </div>
      </div>
    );
  }

  const isArtist = user?.role === 'ARTIST';
  const totalViews = myVideos.reduce((s: number, v: any) => s + (v.views || 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{isArtist ? 'Artist' : 'Fan'} Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.username}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/upload" className="btn-primary text-sm">Upload</Link>
            {isArtist && (
              <Link href="/live" className="btn-secondary text-sm flex items-center gap-1">
                <Radio className="w-4 h-4" /> Go Live
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isArtist && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Earnings</span>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">${(earnings?.totalEarnings || 0).toFixed(2)}</p>
            </div>
          )}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Videos</span>
              <Video className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{myVideos.length}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Referrals</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{referrals?.count || 0}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Views</span>
              <Eye className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold">{totalViews}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Referral Program</h2>
            <p className="text-sm text-gray-500 mb-4">Earn 5% of tips from referred users.</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/auth/register?ref=${user?.id}` : ''}
                className="input-field text-xs flex-1"
              />
              <button onClick={copyReferral} className="btn-primary text-sm flex items-center gap-1">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">My Videos</h2>
            {myVideos.length === 0 ? (
              <p className="text-sm text-gray-500">No videos yet. Upload your first!</p>
            ) : (
              <div className="space-y-3">
                {myVideos.slice(0, 5).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <p className="text-sm font-medium truncate flex-1">{v.caption || 'Untitled'}</p>
                    <span className="text-xs text-gray-500 ml-2">{v.views} views</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
