import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentMusic, setCurrentMusic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Clean up playback state on logout
  useEffect(() => {
    if (!user) {
      setCurrentMusic(null);
      setIsPlaying(false);
      setPlaylist([]);
      setCurrentIndex(0);
    }
  }, [user]);

  const play = (music, queue = [music], index = 0) => {
    setPlaylist(queue);
    setCurrentIndex(index);
    setCurrentMusic(music);
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const resume = () => {
    setIsPlaying(true);
  };

  const stop = () => {
    setCurrentMusic(null);
    setIsPlaying(false);
  };

  const addToPlaylist = (music) => {
    setPlaylist([...playlist, music]);
  };

  const removeFromPlaylist = (index) => {
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
  };

  const playNext = () => {
    if (playlist.length === 0) return;

    const nextIndex =
      currentIndex === playlist.length - 1 ? 0 : currentIndex + 1;

    setCurrentIndex(nextIndex);
    setCurrentMusic(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;

    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;

    setCurrentIndex(prevIndex);
    setCurrentMusic(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const value = {
    currentMusic,
    isPlaying,
    playlist,
    currentIndex,
    play,
    pause,
    resume,
    stop,
    addToPlaylist,
    removeFromPlaylist,
    playNext,
    playPrevious,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};
