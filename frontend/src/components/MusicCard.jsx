import React, { useState, useEffect, useRef } from "react";
import { playlistService } from "../services/playlistService";
import "../styles/MusicCard.css";

export const MusicCard = ({ music, onPlay }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlusClick = async (e) => {
    e.stopPropagation();
    if (showDropdown) {
      setShowDropdown(false);
      return;
    }

    try {
      setLoadingPlaylists(true);
      const data = await playlistService.getUserPlaylists();
      setPlaylists(data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error("Failed to load playlists for dropdown", err);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleSelectPlaylist = async (e, playlistId) => {
    e.stopPropagation();
    try {
      await playlistService.addToPlaylist(playlistId, music.music_id);
      setShowDropdown(false);
      alert(`"${music.title}" added to playlist!`);
    } catch (err) {
      const statusCode = err.response?.status || "Network Error";
      const serverMessage = err.response?.data?.message || err.message;

      alert(`Failed to add song [Status ${statusCode}]: ${serverMessage}`);
    }
  };

  return (
    <div className="music-card" ref={dropdownRef}>
      <div className="music-card-image">
        {music.image ? (
          <img src={music.image} alt={music.title} />
        ) : (
          <div className="card-image-fallback">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        <div className="card-overlay">
          <button
            onClick={() => onPlay(music)}
            className="btn-play"
            title="Play"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <button
            onClick={handlePlusClick}
            className="btn-add"
            title="Add to Playlist"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>

          {showDropdown && (
            <div className="card-playlist-dropdown">
              <div className="dropdown-title">Add to playlist</div>
              {loadingPlaylists ? (
                <div className="dropdown-item disabled">Loading...</div>
              ) : playlists.length === 0 ? (
                <div className="dropdown-item disabled">No playlists found</div>
              ) : (
                <div className="dropdown-list-scroller">
                  {playlists.map((pl) => (
                    <button
                      key={pl.playlist_id}
                      className="dropdown-item"
                      onClick={(e) => handleSelectPlaylist(e, pl.playlist_id)}
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="music-card-info">
        <h4>{music.title}</h4>
        <p>{music.artist}</p>
        <small>{music.album}</small>
      </div>
    </div>
  );
};
