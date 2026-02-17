'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Sun, Moon, Menu, X, Music, Radio, Upload, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">Loopzz</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/feed" className="text-sm font-medium hover:text-violet-500 transition-colors">Feed</Link>
            <Link href="/live" className="text-sm font-medium hover:text-violet-500 transition-colors flex items-center gap-1"><Radio className="w-4 h-4" /> Live</Link>
            {isAuthenticated && (
              <>
                <Link href="/upload" className="text-sm font-medium hover:text-violet-500 transition-colors flex items-center gap-1"><Upload className="w-4 h-4" /> Upload</Link>
                <Link href="/dashboard" className="text-sm font-medium hover:text-violet-500 transition-colors flex items-center gap-1"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm font-medium">{user?.username}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">{user?.role}</span>
                <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><LogOut className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm">Log in</Link>
                <Link href="/auth/register" className="btn-primary text-sm">Sign up</Link>
              </div>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 space-y-3">
          <Link href="/feed" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Feed</Link>
          <Link href="/live" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Live</Link>
          {isAuthenticated ? (
            <>
              <Link href="/upload" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Upload</Link>
              <Link href="/dashboard" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="block py-2 text-sm text-red-500">Log out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="btn-secondary text-sm flex-1 text-center" onClick={() => setOpen(false)}>Log in</Link>
              <Link href="/auth/register" className="btn-primary text-sm flex-1 text-center" onClick={() => setOpen(false)}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
