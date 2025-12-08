'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Fortuna Center',
    siteDescription: 'Minimalist broadcast platform',
    autoArchive: true,
    emailNotifications: true,
    maxConcurrentSessions: 10,
    defaultQuality: '1080p',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Settings</h1>
          <p className="text-default-500 mt-1">Configure your broadcast system</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Icon icon="solar:diskette-bold" />
          Save Changes
        </button>
      </div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 border border-default-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <Icon icon="solar:settings-bold-duotone" className="text-2xl text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-default-900">General Settings</h2>
            <p className="text-default-500 text-sm">Basic configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-default-500 mb-2 block">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-3 bg-default-50 border border-default-200 rounded-xl text-default-900 placeholder-default-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-default-500 mb-2 block">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-default-50 border border-default-200 rounded-xl text-default-900 placeholder-default-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Broadcast Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-6 border border-default-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-500/10">
            <Icon icon="solar:video-library-bold-duotone" className="text-2xl text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-default-900">Broadcast Settings</h2>
            <p className="text-default-500 text-sm">Configure broadcast behavior</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-default-500 mb-2 block">Max Concurrent Sessions</label>
            <input
              type="number"
              value={settings.maxConcurrentSessions}
              onChange={(e) => setSettings({ ...settings, maxConcurrentSessions: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-default-50 border border-default-200 rounded-xl text-default-900 placeholder-default-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-default-500 mb-2 block">Default Quality</label>
            <select
              value={settings.defaultQuality}
              onChange={(e) => setSettings({ ...settings, defaultQuality: e.target.value })}
              className="w-full px-4 py-3 bg-default-50 border border-default-200 rounded-xl text-default-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="1440p">1440p</option>
              <option value="4K">4K</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-default-50 border border-default-200">
            <div>
              <p className="text-default-900 font-medium">Auto Archive Sessions</p>
              <p className="text-default-500 text-sm">Automatically archive ended sessions</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoArchive: !settings.autoArchive })}
              className={`relative w-14 h-8 rounded-full transition-all ${
                settings.autoArchive ? 'bg-primary' : 'bg-default-100'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  settings.autoArchive ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-6 border border-default-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <Icon icon="solar:bell-bold-duotone" className="text-2xl text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-default-900">Notifications</h2>
            <p className="text-default-500 text-sm">Manage notification preferences</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { title: 'Email Notifications', desc: 'Receive email updates', key: 'emailNotifications' },
            { title: 'Session Start Alerts', desc: 'Get notified when sessions start', key: 'sessionAlerts' },
            { title: 'Viewer Milestones', desc: 'Alerts for viewer count milestones', key: 'milestoneAlerts' },
            { title: 'System Updates', desc: 'Important system notifications', key: 'systemUpdates' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-xl bg-default-50 border border-default-200 hover:border-default-300 transition-all"
            >
              <div>
                <p className="text-default-900 font-medium">{item.title}</p>
                <p className="text-default-500 text-sm">{item.desc}</p>
              </div>
              <button
                className={`relative w-14 h-8 rounded-full transition-all ${
                  idx === 0 ? 'bg-primary' : 'bg-default-100'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                    idx === 0 ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-2xl p-6 border border-red-500/20 bg-red-500/5"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-red-500/10">
            <Icon icon="solar:danger-bold-duotone" className="text-2xl text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-default-900">Danger Zone</h2>
            <p className="text-default-500 text-sm">Irreversible actions</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 rounded-xl bg-default-50 hover:bg-red-500/10 border border-default-200 hover:border-red-500/50 transition-all group">
            <div className="text-left">
              <p className="text-default-900 font-medium group-hover:text-red-400 transition-colors">Clear All Sessions</p>
              <p className="text-default-500 text-sm">Delete all broadcast sessions permanently</p>
            </div>
            <Icon icon="solar:trash-bin-trash-bold" className="text-xl text-default-400 group-hover:text-red-400 transition-colors" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-xl bg-default-50 hover:bg-red-500/10 border border-default-200 hover:border-red-500/50 transition-all group">
            <div className="text-left">
              <p className="text-default-900 font-medium group-hover:text-red-400 transition-colors">Reset to Default</p>
              <p className="text-default-500 text-sm">Reset all settings to default values</p>
            </div>
            <Icon icon="solar:restart-bold" className="text-xl text-default-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
