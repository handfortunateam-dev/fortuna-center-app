'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  bgColor: string;
  textColor: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  bgColor,
  textColor,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon icon={icon} className={`text-2xl ${textColor}`} />
        </div>
        <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
          {change}
        </span>
      </div>
      <h3 className="text-white/60 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}
