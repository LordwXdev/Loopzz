'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { liveAPI, tipsAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Radio, Eye, Send, DollarSign, X } from 'lucide-react';

export default function LiveSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [tipAmount, setTipAmount] = useState('');
  const [showTip, setShowTip] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    liveAPI.getSession(sessionId).then(({ data }) => {
      setSession(data);
      setViewerCount(data.viewers);
      const socket = getSocket();
      socketRef.current = socket;
      socket.emit('join-session', { sessionId, username: user?.username || 'Guest' });
      socket.on('chat-message', (msg: any) => setMessages(prev => [...prev, msg]));
      socket.on('viewer-count', (d: any) => setViewerCount(d.count));
      socket.on('user-joined', (d: any) => setMessages(prev => [...prev, { userId: 'system', username: 'System', message: `${d.username} joined`, timestamp: new Date().toISOString() }]));
    }).catch(console.error).finally(() => setLoading(false));

    return () => { socketRef.current?.emit('leave-session', { sessionId, username: user?.username || 'Guest' }); };
  }, [sessionId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim() || !socketRef.current || !user) return;
    socketRef.current.emit('chat-message', { sessionId, userId: user.id, username: user.username, message: chatInput });
    setChatInput('');
  };

  const sendTip = async () => {
    if (!session || !tipAmount) return;
    try {
      await tipsAPI.send({ toArtistId: session.artistId, amount: parseFloat(tipAmount) });
      setTipAmount(''); setShowTip(false);
    } catch (err: any) { alert(err.response?.data?.message || 'Tip failed'); }
  };

  const endSession = async () => {
    if (!session) return;
    try { await liveAPI.end(session.id); router.push('/live'); } catch {}
  };

  const isHost = user?.id === session?.artist?.user?.id;

  if (loading) return <div className="min-h-screen"><Navbar /><div className="max-w-6xl mx-auto px-4 py-8"><div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" /></div></div>;
  if (!session) return <div className="min-h-screen"><Navbar /><div className="max-w-6xl mx-auto px-4 py-8 text-center"><h1 className="text-2xl font-bold">Session not found</h1></div></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="lg:col-span-2 flex flex-col">
            <div className="relative flex-1 bg-gray-900 rounded-xl flex items-center justify-center min-h-[300px]">
              <div className="text-center text-white">
                <Radio className="w-16 h-16 mx-auto mb-4 animate-pulse text-red-500" />
                <h2 className="text-xl font-bold">{session.title}</h2>
                <p className="text-gray-400 mt-1">by {session.artist?.user?.username}</p>
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-3">
                <span className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-full font-medium"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE</span>
                <span className="flex items-center gap-1 px-3 py-1 bg-black/60 text-white text-sm rounded-full"><Eye className="w-4 h-4" /> {viewerCount}</span>
              </div>
              {isHost && <button onClick={endSession} className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm rounded-full hover:bg-red-700">End Stream</button>}
            </div>
            <div className="flex items-center gap-3 mt-3">
              {isAuthenticated && !isHost && (
                <button onClick={() => setShowTip(!showTip)} className="btn-primary text-sm flex items-center gap-1"><DollarSign className="w-4 h-4" /> Tip</button>
              )}
            </div>
            {showTip && (
              <div className="card p-4 mt-3">
                <div className="flex justify-between mb-3"><h3 className="font-semibold text-sm">Send Tip</h3><button onClick={() => setShowTip(false)}><X className="w-4 h-4" /></button></div>
                <div className="flex gap-2 mb-2">{[5,10,25,50].map(a => <button key={a} onClick={() => setTipAmount(String(a))} className={`px-3 py-1 rounded-lg text-sm font-medium ${tipAmount===String(a)?'bg-violet-600 text-white':'bg-gray-100 dark:bg-gray-800'}`}>${a}</button>)}</div>
                <input type="number" value={tipAmount} onChange={e => setTipAmount(e.target.value)} className="input-field text-sm mb-2" placeholder="Custom amount" min="1" />
                <button onClick={sendTip} disabled={!tipAmount} className="btn-primary w-full text-sm">Send ${tipAmount || '0'}</button>
              </div>
            )}
          </div>
          <div className="card flex flex-col min-h-[400px]">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800"><span className="font-semibold text-sm">Live Chat</span></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.userId === 'system' ? 'text-gray-500 italic text-xs' : ''}`}>
                  {msg.userId !== 'system' && <span className="font-semibold text-violet-500">{msg.username}: </span>}
                  <span>{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {isAuthenticated && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="input-field text-sm flex-1" placeholder="Message..." />
                <button onClick={sendMessage} className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"><Send className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
