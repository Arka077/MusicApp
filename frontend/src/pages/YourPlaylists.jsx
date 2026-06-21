import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { playlistService } from "../services/playlistService";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import "../styles/Playlists.css";

export const YourPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = async () => {
    try {
      setLoading(true);
      const data = await playlistService.getUserPlaylists();
      setPlaylists(data || []);
    } catch (err) {
      setError("Failed to load your playlists");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="playlists-page">
      <div className="playlists-header">
        <div>
          <h2>Your Playlists</h2>
          <p className="subtitle">Your custom musical configurations</p>
        </div>
        <button
          className="btn btn-primary create-nav-btn"
          onClick={() => navigate("/playlists/new")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Create Playlist
        </button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {playlists.length === 0 ? (
        <div className="playlists-empty">
          <div className="empty-icon">🎵</div>
          <h3>No Playlists Yet</h3>
          <p>
            Create a playlist to start organizing your favorite musical
            compositions.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/playlists/new")}
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <Link
              to={`/playlists/${playlist.playlist_id}`}
              key={playlist.playlist_id}
              className="playlist-item-card"
            >
              <div className="playlist-cover-placeholder">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div className="playlist-card-meta">
                <h4>{playlist.name}</h4>
                <p className="playlist-desc">
                  {playlist.description || "No description provided."}
                </p>
                <div className="playlist-badge-row">
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
