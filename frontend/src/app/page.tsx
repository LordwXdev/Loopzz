'use client';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { Music, Radio, DollarSign, Users, Zap, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const features = [
    { icon: Music, title: 'Share Music & Video', desc: 'Upload tracks and short videos to build your audience.' },
    { icon: Radio, title: 'Go Live', desc: 'Stream live performances and connect with fans in real-time.' },
    { icon: DollarSign, title: 'Earn Tips', desc: 'Fans can tip you directly. Track your earnings in real-time.' },
    { icon: Users, title: 'Referral Rewards', desc: 'Invite friends and earn a percentage of their activity.' },
    { icon: Zap, title: 'AI-Powered Feed', desc: 'Smart ranking puts the best content in front of the right audience.' },
    { icon: TrendingUp, title: 'Analytics', desc: 'Track views, plays, earnings, and growth from your dashboard.' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-pink-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative text-center">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
            Your music, <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">amplified</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Share your sound, go live, earn from your art. Loopzz connects fans and artists through music, video, and live streaming.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoading && !isAuthenticated ? (
              <><Link href="/auth/register" className="btn-primary text-lg px-8 py-3">Get Started Free</Link><Link href="/feed" className="btn-secondary text-lg px-8 py-3">Explore Feed</Link></>
            ) : (
              <><Link href="/dashboard" className="btn-primary text-lg px-8 py-3">Go to Dashboard</Link><Link href="/feed" className="btn-secondary text-lg px-8 py-3">Browse Feed</Link></>
            )}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-100/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything artists need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} Loopzz</div>
      </footer>
    </div>
  );
}
