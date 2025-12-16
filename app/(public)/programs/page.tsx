import { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@iconify/react";

export const metadata: Metadata = {
  title: "Our Programs",
  description:
    "Explore our training programs including Broadcast training and LMS.",
};

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Our Programs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the pathways to your professional success through our
            specialized training programs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Link
            href="/programs/broadcast"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                <Icon icon="solar:microphone-3-bold" className="text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                Broadcast Training
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Master the art of public speaking, radio broadcasting, and digital
              media production in our state-of-the-art studio environment.
            </p>
            <div className="flex items-center text-red-600 font-semibold group-hover:gap-2 transition-all">
              Learn More <Icon icon="lucide:arrow-right" className="ml-2" />
            </div>
          </Link>

          <Link
            href="/programs/lms"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Icon icon="solar:laptop-bold" className="text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                LMS & English Course
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Access comprehensive English language courses and HRD training
              materials through our modern Learning Management System.
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Access LMS <Icon icon="lucide:arrow-right" className="ml-2" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
