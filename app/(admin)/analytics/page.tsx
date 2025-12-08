'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const viewerTrends = [
  { date: '2024-01-15', viewers: 1200 },
  { date: '2024-01-16', viewers: 1450 },
  { date: '2024-01-17', viewers: 1100 },
  { date: '2024-01-18', viewers: 1800 },
  { date: '2024-01-19', viewers: 2100 },
  { date: '2024-01-20', viewers: 1950 },
  { date: '2024-01-21', viewers: 2340 },
];

const sessionsByCategory = [
  { name: 'Gaming', value: 35, color: '#3b82f6' },
  { name: 'Music', value: 25, color: '#a855f7' },
  { name: 'Tech', value: 20, color: '#fbbf24' },
  { name: 'Education', value: 15, color: '#10b981' },
  { name: 'Others', value: 5, color: '#6b7280' },
];

const hourlyViewers = [
  { hour: '00:00', viewers: 120 },
  { hour: '04:00', viewers: 89 },
  { hour: '08:00', viewers: 234 },
  { hour: '12:00', viewers: 456 },
  { hour: '16:00', viewers: 678 },
  { hour: '20:00', viewers: 543 },
  { hour: '23:59', viewers: 321 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Analytics</h1>
          <p className="text-default-500 mt-1">Detailed insights about your broadcasts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-default-50 hover:bg-default-100 text-default-900 border border-default-200 transition-all">
            <Icon icon="solar:calendar-bold" />
            Last 7 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
            <Icon icon="solar:download-bold" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Views', value: '124.5K', change: '+12.5%', icon: 'solar:eye-bold-duotone', color: 'blue' },
          { title: 'Avg. Watch Time', value: '18m 32s', change: '+8.2%', icon: 'solar:clock-circle-bold-duotone', color: 'purple' },
          { title: 'Engagement Rate', value: '68.4%', change: '+5.1%', icon: 'solar:heart-bold-duotone', color: 'pink' },
          { title: 'Peak Concurrent', value: '2,341', change: '+23.4%', icon: 'solar:users-group-rounded-bold-duotone', color: 'green' },
        ].map((metric, idx) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel rounded-2xl p-6 border border-default-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${metric.color}-500/10`}>
                <Icon icon={metric.icon} className={`text-2xl text-${metric.color}-400`} />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                {metric.change}
              </span>
            </div>
            <p className="text-default-500 text-sm mb-1">{metric.title}</p>
            <p className="text-2xl font-bold text-default-900">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viewer Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 border border-default-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-default-900">Viewer Trends</h2>
              <p className="text-default-500 text-sm mt-1">Daily viewer count</p>
            </div>
            <Icon icon="solar:chart-bold-duotone" className="text-2xl text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={viewerTrends}>
              <defs>
                <linearGradient id="colorViewers2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#171717',
                }}
              />
              <Area
                type="monotone"
                dataKey="viewers"
                stroke="#fbbf24"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViewers2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sessions by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6 border border-default-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-default-900">Sessions by Category</h2>
              <p className="text-default-500 text-sm mt-1">Content distribution</p>
            </div>
            <Icon icon="solar:pie-chart-bold-duotone" className="text-2xl text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sessionsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sessionsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff20',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Hourly Viewers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel rounded-2xl p-6 border border-default-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-default-900">Hourly Viewer Distribution</h2>
            <p className="text-default-500 text-sm mt-1">Peak viewing hours</p>
          </div>
          <Icon icon="solar:graph-bold-duotone" className="text-2xl text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyViewers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                color: '#171717',
              }}
            />
            <Bar dataKey="viewers" fill="#fbbf24" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Performing Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-panel rounded-2xl p-6 border border-default-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-default-900">Top Performing Sessions</h2>
            <p className="text-default-500 text-sm mt-1">Best sessions this week</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { title: 'Music Concert - Live Performance', views: 12450, duration: '3h 20m', engagement: '92%' },
            { title: 'Gaming Tournament Finals', views: 10230, duration: '4h 15m', engagement: '88%' },
            { title: 'Tech Product Launch', views: 8960, duration: '1h 45m', engagement: '85%' },
            { title: 'Cooking Masterclass', views: 7820, duration: '2h 30m', engagement: '81%' },
          ].map((session, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 rounded-xl bg-default-50 hover:bg-default-100 border border-default-200 hover:border-default-300 transition-all"
            >
              <div className="flex-1">
                <h3 className="text-default-900 font-medium mb-1">{session.title}</h3>
                <div className="flex items-center gap-4 text-sm text-default-500">
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:eye-bold" />
                    {session.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:clock-circle-bold" />
                    {session.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:heart-bold" />
                    {session.engagement} engagement
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">#{idx + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
