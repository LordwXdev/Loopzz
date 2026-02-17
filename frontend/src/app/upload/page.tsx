'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { videosAPI, tracksAPI } from '@/lib/api';
import { Upload as UploadIcon, Video, Music, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<'video' | 'track'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, isLoading]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true); setError(''); setSuccess('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      if (tab === 'video') {
        formData.append('caption', caption);
        await videosAPI.upload(formData);
        setSuccess('Video uploaded!');
      } else {
        formData.append('title', title);
        await tracksAPI.upload(formData);
        setSuccess('Track uploaded!');
      }
      setFile(null); setCaption(''); setTitle('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Upload Content</h1>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('video')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'video' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <Video className="w-4 h-4" /> Video
          </button>
          {user?.role === 'ARTIST' && (
            <button onClick={() => setTab('track')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'track' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <Music className="w-4 h-4" /> Track
            </button>
          )}
        </div>
        {success && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400 text-sm"><CheckCircle className="w-4 h-4" /> {success}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <form onSubmit={handleUpload} className="card p-6 space-y-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-violet-500 transition-colors" onClick={() => document.getElementById('file-input')?.click()}>
            <input id="file-input" type="file" className="hidden" accept={tab === 'video' ? 'video/*' : 'audio/*'} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file ? <><CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" /><p className="font-medium">{file.name}</p><p className="text-sm text-gray-500">{(file.size/1024/1024).toFixed(1)} MB</p></> : <><UploadIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" /><p className="font-medium">Click to upload</p></>}
          </div>
          {tab === 'video' ? <div><label className="block text-sm font-medium mb-1.5">Caption</label><textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="input-field resize-none" rows={3} /></div>
          : <div><label className="block text-sm font-medium mb-1.5">Track Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required /></div>}
          <button type="submit" disabled={!file || uploading} className="btn-primary w-full py-3">{uploading ? 'Uploading...' : 'Upload'}</button>
        </form>
      </div>
    </div>
  );
}
