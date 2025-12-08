"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Input, Avatar, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareButton } from "@/components/ui/ShareButton";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  avatar: string;
  timestamp: Date;
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 transition-colors">
      {/* Tabs Navigation - Stick to top or just below header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as "video" | "audio")}
            size="lg"
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0",
              cursor: "w-full bg-red-600",
              tab: "max-w-fit px-4 h-14",
              tabContent:
                "group-data-[selected=true]:text-red-600 text-gray-500 font-medium",
            }}
          >
            <Tab
              key="video"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="logos:youtube-icon" className="text-xl" />
                  <span>Video Stream</span>
                </div>
              }
            />
            <Tab
              key="audio"
              title={
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:radio-minimalistic-bold"
                    className="text-xl text-blue-500"
                  />
                  <span>Audio Stream</span>
                </div>
              }
            />
          </Tabs>
        </div>
      </div>

      <div className="pt-6">
        <AnimatePresence mode="wait">
          {activeTab === "video" ? (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YouTubeDemo />
            </motion.div>
          ) : (
            <motion.div
              key="audio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AudioDemo />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// YOUTUBE STYLE UI
// ==========================================

function YouTubeDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "Sarah Johnson",
      message: "This English lesson is amazing! 👏",
      avatar: "https://i.pravatar.cc/150?img=1",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      user: "Mike Chen",
      message: "The grammar explanation was very clear.",
      avatar: "https://i.pravatar.cc/150?img=2",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      user: "Emma Davis",
      message: "Hello everyone from London! 🇬🇧",
      avatar: "https://i.pravatar.cc/150?img=3",
      timestamp: new Date(Date.now() - 180000),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: newMessage,
      avatar: "https://i.pravatar.cc/150?img=10",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const relatedVideos = [
    {
      title: "Advanced English Conversation",
      views: "12K views",
      time: "2 days ago",
      img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=300&h=170",
    },
    {
      title: "Common Grammar Mistakes",
      views: "8.5K views",
      time: "5 days ago",
      img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=300&h=170",
    },
    {
      title: "IELTS Speaking Tips 2024",
      views: "45K views",
      time: "1 week ago",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300&h=170",
    },
    {
      title: "Learn English with Movies",
      views: "120K views",
      time: "2 weeks ago",
      img: "https://images.unsplash.com/photo-1489599849909-5241975b9863?auto=format&fit=crop&q=80&w=300&h=170",
    },
  ];

  return (
    <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 xl:col-span-3">
          {/* Video Player */}
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg mb-4">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              🔴 Live English Masterclass: Advanced Grammar & Speaking
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <Avatar
                  src="https://i.pravatar.cc/150?img=32"
                  size="md"
                  className="ring-2 ring-gray-100"
                />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Fortuna Center
                  </h3>
                  <p className="text-sm text-gray-500">12.5K subscribers</p>
                </div>
                <Button className="bg-black text-white dark:bg-white dark:text-black rounded-full font-medium ml-2 px-6">
                  Subscribe
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <Button
                    variant="light"
                    className="rounded-none px-4 gap-2 border-r border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    startContent={
                      <Icon icon="solar:like-bold" className="text-xl" />
                    }
                  >
                    1.2K
                  </Button>
                  <Button
                    variant="light"
                    className="rounded-none px-4 hover:bg-gray-200 dark:hover:bg-gray-700"
                    startContent={
                      <Icon icon="solar:dislike-bold" className="text-xl" />
                    }
                  />
                </div>
                <ShareButton
                  url="https://fortunacenter.com/demo"
                  title="Live English Masterclass"
                  className="bg-gray-100 dark:bg-gray-800 rounded-full font-medium px-4 text-gray-700 dark:text-gray-200"
                  variant="flat"
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
              <div className="flex gap-2 font-bold text-gray-900 dark:text-white mb-2">
                <span>845 watching</span>
                <span>•</span>
                <span>Started streaming 45 minutes ago</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                Welcome to our daily live English lesson! Today we are covering
                advanced grammar structures and improving your speaking skills.
                📚 Topics covered: - Present Perfect Continuous - Inversion in
                English - Idioms for Business Don't forget to like and subscribe
                for more daily lessons!
              </p>
              <Button
                size="sm"
                variant="light"
                className="text-gray-500 font-semibold mt-2 p-0 h-auto"
              >
                Show more
              </Button>
            </div>

            {/* Comments Section (Simplified) */}
            <div className="pt-6 hidden lg:block">
              <h3 className="font-bold text-xl mb-6">128 Comments</h3>
              <div className="flex gap-4 mb-8">
                <Avatar
                  src="https://i.pravatar.cc/150?img=10"
                  className="w-10 h-10"
                />
                <div className="flex-1">
                  <Input
                    placeholder="Add a comment..."
                    variant="underlined"
                    classNames={{ inputWrapper: "border-b-1" }}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button size="sm" variant="light">
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      className="bg-blue-600 rounded-full"
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
              {/* Mock comments */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 mb-6">
                  <Avatar
                    src={`https://i.pravatar.cc/150?img=${i + 20}`}
                    className="w-10 h-10"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        User {i + 20}
                      </span>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Great lesson! Really helped me understand the topic better
                      based on the clear examples.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                        <Icon icon="solar:like-outline" /> 12
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                        <Icon icon="solar:dislike-outline" />
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-900 font-semibold">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Chat & Recommendations) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Chat Component */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-none h-[600px] flex flex-col rounded-xl">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Top Chat
              </h3>
              <Icon icon="solar:menu-dots-bold" className="text-gray-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900 scrollbar-hide">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <Avatar
                      src={msg.avatar}
                      size="sm"
                      className="w-6 h-6 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-medium text-gray-500 text-xs mr-2">
                        {msg.user}
                      </span>
                      <span className="text-gray-900 dark:text-gray-200 text-sm break-words">
                        {msg.message}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">
                    Your message as{" "}
                    <span className="font-bold text-gray-700">You</span>
                  </span>
                </div>
                <div className="relative">
                  <Input
                    className="w-full"
                    placeholder="Chat..."
                    value={newMessage}
                    onValueChange={setNewMessage}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    variant="flat"
                    radius="full"
                    classNames={{
                      inputWrapper: "bg-gray-100 dark:bg-gray-800 pr-10",
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  >
                    <Icon icon="solar:plain-3-bold" className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Related Videos */}
          <div className="space-y-4">
            {relatedVideos.map((video, idx) => (
              <div key={idx} className="flex gap-2 group cursor-pointer">
                <div className="relative w-40 h-24 shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={video.img}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                    12:45
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white dark:group-hover:text-blue-400 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-gray-500">Fortuna Center</p>
                  <p className="text-xs text-gray-500">
                    {video.views} • {video.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// AZURACAST STYLE UI (Replicated)
// ==========================================

// Mock data to match Azuracast interface
const mockStation = {
  name: "Fortuna Broadcast Center (Demo)",
  description:
    "Streaming our latest shows, music, and student-led programming 24/7.",
};

const mockNowPlaying = {
  live: {
    is_live: true,
    streamer_name: "Live Studio Broadcast",
  },
  now_playing: {
    song: {
      title: "English Learning Podcast",
      artist: "Fortuna Education",
    },
    played_at: Math.floor(Date.now() / 1000) - 300, // 5 mins ago
  },
  listeners: {
    current: 125,
    total: 1542,
  },
  song_history: [
    {
      song: { title: "Morning Grammar Drill", artist: "Ms. Sarah" },
      played_at: Math.floor(Date.now() / 1000) - 600,
    },
    {
      song: { title: "Vocabulary Session 101", artist: "Mr. James" },
      played_at: Math.floor(Date.now() / 1000) - 1200,
    },
    {
      song: { title: "Student Stories: My Journey", artist: "Student Council" },
      played_at: Math.floor(Date.now() / 1000) - 2400,
    },
  ],
};

const mockStreams = [
  {
    id: 1,
    name: "High Quality Stream",
    is_default: true,
    format: "mp3",
    bitrate: 128,
    listeners: { current: 125, total: 200 },
    url: "#",
  },
  {
    id: 2,
    name: "Mobile Low Bandwidth",
    is_default: false,
    format: "aac",
    bitrate: 64,
    listeners: { current: 45, total: 100 },
    url: "#",
  },
];

function AudioDemo() {
  const nowPlayingUpdated = formatDistanceToNow(
    mockNowPlaying.now_playing.played_at * 1000,
    { addSuffix: true }
  );

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <section className="bg-gradient-to-b from-red-900 via-red-800 to-yellow-900 dark:from-red-950 dark:via-red-900 dark:to-yellow-950 text-white px-6 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-yellow-200">
              Fortuna Broadcast Center
            </p>
            <h1 className="text-4xl font-semibold">{mockStation.name}</h1>
            <p className="text-yellow-100 max-w-3xl">
              {mockStation.description}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="text-sm uppercase text-yellow-200 tracking-wide">
                  {mockNowPlaying.live.is_live
                    ? "Live Broadcast"
                    : "Now Playing"}
                </span>
                <h2 className="text-2xl font-semibold">
                  {mockNowPlaying.live.is_live
                    ? mockNowPlaying.live.streamer_name
                    : mockNowPlaying.now_playing.song.title}
                </h2>
                <p className="text-yellow-100">
                  {mockNowPlaying.live.is_live
                    ? `${mockNowPlaying.now_playing.song.title} - ${mockNowPlaying.now_playing.song.artist}`
                    : mockNowPlaying.now_playing.song.artist}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-yellow-100">
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:users" className="w-4 h-4" />
                  {mockNowPlaying.listeners.current} listening now
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:clock-3" className="w-4 h-4" />
                  Updated {nowPlayingUpdated}
                </span>
                <ShareButton
                  url="/demo"
                  title={mockStation.name}
                  text="Check out this broadcast!"
                  variant="solid"
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30"
                />
              </div>
            </div>
            {/* Fake Audio Player */}
            <div className="w-full bg-black/20 rounded-lg p-3 flex items-center gap-4">
              <Button
                isIconOnly
                className="rounded-full bg-white text-black hover:scale-105"
                size="lg"
              >
                <Icon icon="solar:play-bold" className="text-xl" />
              </Button>
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="w-0 h-full bg-white animate-[width_2s_ease-in-out_infinite]"
                  style={{ width: "30%" }}
                ></div>
              </div>
              <div className="text-xs font-mono opacity-80">00:00 / LIVE</div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:volume-loud-bold" />
                <div className="w-20 h-1 bg-white/30 rounded-full">
                  <div className="w-[70%] h-full bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recently Played
            </h2>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
              {mockNowPlaying.song_history.map((entry) => (
                <div
                  key={`${entry.played_at}-${entry.song.title}`}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {entry.song.title}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.song.artist}
                    </span>
                  </div>
                  <time className="text-xs text-gray-400">
                    {formatDistanceToNow(entry.played_at * 1000, {
                      addSuffix: true,
                    })}
                  </time>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Stream Details
            </h2>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
              {mockStreams.map((stream) => (
                <div key={stream.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {stream.name}{" "}
                        {stream.is_default && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-semibold ml-1">
                            LIVE
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stream.format.toUpperCase()} • {stream.bitrate}kbps
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      className="text-red-600 dark:text-red-400 hover:text-red-500 font-medium p-0"
                      endContent={
                        <Icon
                          icon="lucide:arrow-up-right"
                          className="w-4 h-4 ml-1"
                        />
                      }
                    >
                      Listen
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stream.listeners.current} listeners (peak{" "}
                    {stream.listeners.total})
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4 space-y-2">
              <p className="text-sm uppercase tracking-wide text-red-700 dark:text-red-400 font-semibold">
                HLS STREAM
              </p>
              <p className="text-gray-800 dark:text-gray-300 text-sm">
                Adaptive streaming is available for modern players.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-red-700 dark:text-red-400 font-medium text-sm"
              >
                Open HLS Stream <Icon icon="lucide:link" className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
