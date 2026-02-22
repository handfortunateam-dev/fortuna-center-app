"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | ReactNode;
  change?: string;
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
      className="backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group shadow-sm dark:shadow-none"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon icon={icon} className={`text-2xl ${textColor}`} />
        </div>
        {change && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-2 py-1 rounded-lg">
            {change}
          </span>
        )}
      </div>
      <Text size="sm" color="muted" weight="medium" className="mb-1">
        {title}
      </Text>
      <Heading
        as="h3"
        size="3xl"
        weight="bold"
        className="text-gray-900 dark:text-white"
      >
        {value}
      </Heading>
    </motion.div>
  );
}
