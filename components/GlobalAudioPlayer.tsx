"use client";

import { useRef, useEffect } from "react";
import { Avatar, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAudioPlayer } from "@/providers/AudioPlayerContext";

export function GlobalAudioPlayer() {
  const {
    playingEpisode,
    currentPodcast,
    isPlaying,
    setPlayingState,
    closePlayer,
  } = useAudioPlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio element with isPlaying state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.error("Audio playback failed:", e);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  if (!playingEpisode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 animate-slide-up">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-1/3 min-w-0">
          {playingEpisode.art ? (
            <Avatar
              src={playingEpisode.art}
              alt={playingEpisode.title}
              className="w-12 h-12 shrink-0"
              radius="md"
            />
          ) : (
            <Avatar
              icon={<Icon icon="lucide:music" className="w-6 h-6" />}
              className="w-12 h-12 shrink-0 bg-gray-100 dark:bg-gray-800"
              radius="md"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
              {playingEpisode.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentPodcast?.title || "Podcast"}
            </p>
          </div>
        </div>

        <div className="w-full sm:flex-1">
          <audio
            ref={audioRef}
            controls
            autoPlay
            className="w-full h-10"
            src={playingEpisode.audioUrl}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onEnded={() => setPlayingState(false)}
          />
        </div>

        <div className="hidden sm:block">
          <Button isIconOnly variant="light" onPress={closePlayer}>
            <Icon icon="lucide:x" className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
