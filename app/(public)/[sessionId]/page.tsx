'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
// import { FaShareAlt, FaYoutube, FaCopy, FaCheck } from 'react-icons/fa';
import { Icon } from '@iconify/react';
import axios from 'axios';


export default function BroadcastPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await axios.get(`/api/get-session/${sessionId}`);
        setVideoId(response.data.youtubeVideoId);
      } catch (error) {
        console.error('Failed to load session', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm font-mono">INITIALIZING BROADCAST...</p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Broadcast Not Found</h1>
          <p className="text-white/50 mt-2">The session ID might be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-mono text-sm font-bold tracking-wider text-white/80">
              LIVE BROADCAST
            </span>
          </div>
          
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-xs font-medium"
          >
            {copied ? <Icon icon="icon-park-outline:check" className="text-green-500" /> : <Icon icon="icon-park-outline:share" />}
            {copied ? 'COPIED' : 'SHARE LINK'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group"
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>

        <div className="w-full max-w-5xl mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white/90">Fortuna Center Broadcast</h1>
            <p className="text-sm text-white/40 mt-1">Session ID: <span className="font-mono text-primary">{sessionId}</span></p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Placeholder for future controls if needed */}
          </div>
        </div>
      </div>
    </main>
  );
}
