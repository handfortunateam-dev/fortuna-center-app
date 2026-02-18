"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Generic player interfaces that work with both AzuraCast and in-house podcasts
export interface PlayerEpisode {
  id: string;
  title: string;
  art: string | null;
  audioUrl: string;
}

export interface PlayerPodcast {
  id: string;
  title: string;
}

interface AudioPlayerContextType {
  playingEpisode: PlayerEpisode | null;
  currentPodcast: PlayerPodcast | null;
  isPlaying: boolean;
  playEpisode: (episode: PlayerEpisode, podcast: PlayerPodcast) => void;
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
  const [playingEpisode, setPlayingEpisode] = useState<PlayerEpisode | null>(
    null
  );
  const [currentPodcast, setCurrentPodcast] = useState<PlayerPodcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playEpisode = (episode: PlayerEpisode, podcast: PlayerPodcast) => {
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
