import React, { useRef, useEffect, useState } from "react";
import { useMusic } from "../hooks/useMusic";
import { formatTime } from "../utils/helpers";
import "../styles/MusicPlayer.css";

export const MusicPlayer = () => {
  const { currentMusic, isPlaying, play, pause, playNext, playPrevious } =
    useMusic();
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && currentMusic?.url) {
      audioRef.current.play().catch((err) => console.error("Play error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentMusic]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (currentMusic) {
      play(currentMusic);
    }
  };

  if (!currentMusic) {
    return <div className="player-placeholder">No music selected</div>;
  }

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={currentMusic.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
      />

      {/* Left Section: Track Details */}
      <div className="player-info">
        <h3>{currentMusic.title}</h3>
        <p>{currentMusic.artist}</p>
      </div>

      {/* Center Section: Modernized Controls */}
      <div className="player-controls">
        <button onClick={playPrevious} className="control-btn" title="Previous">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={handlePlayPause}
          className="control-btn play-btn"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            /* Modern Pause Icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            /* Modern Play Icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button onClick={playNext} className="control-btn" title="Next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* Right Section: Timeline Progress */}
      <div className="player-progress">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="progress-bar"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>
    </div>
  );
};
