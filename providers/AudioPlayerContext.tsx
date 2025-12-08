"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Podcast, PodcastEpisode } from "@/services/azurecast/interfaces";

interface AudioPlayerContextType {
  playingEpisode: PodcastEpisode | null;
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  playEpisode: (episode: PodcastEpisode, podcast: Podcast) => void;
  pauseEpisode: () => void;
  resumeEpisode: () => void;
  togglePlay: () => void;
  closePlayer: () => void;
  setPlayingState: (state: boolean) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [playingEpisode, setPlayingEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playEpisode = (episode: PodcastEpisode, podcast: Podcast) => {
    // If playing the same episode, just ensure it's playing
    if (playingEpisode?.id === episode.id) {
      if (!isPlaying) setIsPlaying(true);
      return;
    }

    // If a new episode, set it and play
    setPlayingEpisode(episode);
    setCurrentPodcast(podcast);
    setIsPlaying(true);
  };

  const pauseEpisode = () => setIsPlaying(false);

  const resumeEpisode = () => {
    if (playingEpisode) setIsPlaying(true);
  };

  const togglePlay = () => {
    if (playingEpisode) {
      setIsPlaying((prev) => !prev);
    }
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setPlayingEpisode(null);
    setCurrentPodcast(null);
  };

  const setPlayingState = (state: boolean) => {
    setIsPlaying(state);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        playingEpisode,
        currentPodcast,
        isPlaying,
        playEpisode,
        pauseEpisode,
        resumeEpisode,
        togglePlay,
        closePlayer,
        setPlayingState,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider"
    );
  }
  return context;
}
