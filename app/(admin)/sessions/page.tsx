'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@heroui/react';
import Link from 'next/link';

const sessions = [
  {
    id: 'sess_001',
    title: 'Live Gaming Session - Valorant Tournament',
    youtubeId: 'dQw4w9WgXcQ',
    status: 'live',
    viewers: 1234,
    peakViewers: 1456,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: '2h 15m',
  },
  {
    id: 'sess_002',
    title: 'Product Launch Event 2024',
    youtubeId: 'abc123def45',
    status: 'live',
    viewers: 856,
    peakViewers: 920,
    startedAt: new Date(Date.now() - 45 * 60 * 1000),
    duration: '45m',
  },
  {
    id: 'sess_003',
    title: 'Music Concert - Live Performance',
    youtubeId: 'xyz789ghi01',
    status: 'ended',
    viewers: 0,
    peakViewers: 2341,
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    duration: '3h 20m',
  },
  {
    id: 'sess_004',
    title: 'Tech Talk - AI and Machine Learning',
    youtubeId: 'mno234pqr56',
    status: 'ended',
    viewers: 0,
    peakViewers: 432,
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: '1h 30m',
  },
  {
    id: 'sess_005',
    title: 'Cooking Show - Italian Cuisine',
    youtubeId: 'stu567vwx89',
    status: 'ended',
    viewers: 0,
    peakViewers: 678,
    startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    duration: '2h 00m',
  },
];

export default function SessionsPage() {
  const [filter, setFilter] = useState<'all' | 'live' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((session) => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const liveCount = sessions.filter((s) => s.status === 'live').length;
  const endedCount = sessions.filter((s) => s.status === 'ended').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Broadcast Sessions</h1>
          <p className="text-default-500 mt-1">Manage and monitor all your broadcast sessions</p>
        </div>
        <Link href="/admin/sessions/create" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Icon icon="solar:add-circle-bold" className="text-xl" />
          New Session
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 border border-default-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Icon icon="solar:play-circle-bold-duotone" className="text-3xl text-blue-400" />
            </div>
            <div>
              <p className="text-default-500 text-sm">Total Sessions</p>
              <p className="text-3xl font-bold text-default-900">{sessions.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6 border border-default-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10">
              <Icon icon="solar:record-circle-bold-duotone" className="text-3xl text-red-400" />
            </div>
            <div>
              <p className="text-default-500 text-sm">Live Now</p>
              <p className="text-3xl font-bold text-default-900">{liveCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-6 border border-default-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Icon icon="solar:check-circle-bold-duotone" className="text-3xl text-green-400" />
            </div>
            <div>
              <p className="text-default-500 text-sm">Completed</p>
              <p className="text-3xl font-bold text-default-900">{endedCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-2xl p-6 border border-default-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Icon
              icon="solar:magnifer-bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400"
            />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-default-50 border border-default-200 rounded-xl text-default-900 placeholder-default-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(['all', 'live', 'ended'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filter === filterType
                    ? 'bg-primary text-black'
                    : 'bg-default-50 text-default-500 hover:bg-default-100 hover:text-default-900'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-panel rounded-2xl p-6 border border-default-200 hover:border-default-300 transition-all group"
          >
            <div className="flex items-center gap-6">
              {/* Thumbnail */}
              <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-default-50 flex-shrink-0">
                <img
                  src={`https://img.youtube.com/vi/${session.youtubeId}/mqdefault.jpg`}
                  alt={session.title}
                  className="w-full h-full object-cover"
                />
                {session.status === 'live' && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-default-900 font-bold text-lg mb-1 truncate">{session.title}</h3>
                <div className="flex items-center gap-4 text-sm text-default-500">
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:calendar-bold" />
                    {session.startedAt.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:clock-circle-bold" />
                    {session.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:eye-bold" />
                    {session.status === 'live' ? session.viewers : session.peakViewers} viewers
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="p-3 rounded-xl bg-default-50 hover:bg-default-100 text-default-500 hover:text-default-900 transition-all">
                  <Icon icon="solar:eye-bold" className="text-xl" />
                </button>
                <button className="p-3 rounded-xl bg-default-50 hover:bg-default-100 text-default-500 hover:text-default-900 transition-all">
                  <Icon icon="solar:chart-2-bold" className="text-xl" />
                </button>
                <button className="p-3 rounded-xl bg-default-50 hover:bg-default-100 text-default-500 hover:text-red-400 transition-all">
                  <Icon icon="solar:trash-bin-trash-bold" className="text-xl" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 border border-default-200 text-center">
            <Icon icon="solar:inbox-bold-duotone" className="text-6xl text-default-200 mx-auto mb-4" />
            <p className="text-default-500">No sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
