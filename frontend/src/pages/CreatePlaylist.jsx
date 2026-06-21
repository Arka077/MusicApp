import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { playlistService } from "../services/playlistService";
import { Alert } from "../components/Alert";
import "../styles/Playlists.css";

export const CreatePlaylist = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await playlistService.createPlaylist({
        name: name.trim(),
        description: description.trim(),
      });

      // Redirect user back to their dashboard/playlists page upon success
      navigate("/playlists");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playlist-container">
      <div className="playlist-card-form">
        <h2>Create New Playlist</h2>
        <p className="subtitle">Give your music a home</p>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group">
            <label htmlFor="name">Playlist Name</label>
            <input
              type="text"
              id="name"
              placeholder="e.g., Late Night Vibes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              placeholder="Add an optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/playlists")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
