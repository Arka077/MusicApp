import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { playlistService } from "../services/playlistService";
import { useMusic } from "../hooks/useMusic";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import "../styles/Playlists.css";

export const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { play } = useMusic();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      const data = await playlistService.getPlaylistById(id);
      setPlaylist(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load playlist tracks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && playlist && (String(playlist.user_id) === String(user.id || user.user_id));

  const openEditModal = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || "");
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError("Name is required");
      return;
    }
    try {
      setUpdating(true);
      setEditError("");
      const updatedPlaylist = await playlistService.updatePlaylist(id, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setPlaylist({
        ...playlist,
        name: updatedPlaylist.name,
        description: updatedPlaylist.description,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update playlist details");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveTrack = async (musicId) => {
    if (!window.confirm("Are you sure you want to remove this song from the playlist?")) {
      return;
    }
    try {
      await playlistService.removeFromPlaylist(id, musicId);
      setPlaylist({
        ...playlist,
        tracks: playlist.tracks.filter((t) => t.music_id !== musicId),
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove track");
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="playlist-container">
        <Alert
          type="error"
          message={error}
          onClose={() => navigate("/playlists")}
        />
      </div>
    );
  if (!playlist) return null;

  return (
    <div className="playlist-container">
      <button
        className="btn btn-secondary"
        onClick={() => navigate("/playlists")}
        style={{ marginBottom: "20px" }}
      >
        ← Back to Playlists
      </button>

      <div className="playlist-detail-header">
        <div className="playlist-detail-cover">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <div className="playlist-detail-meta">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h2>{playlist.name}</h2>
            {isOwner && (
              <button
                className="btn btn-secondary"
                onClick={openEditModal}
                style={{ padding: "6px 12px", fontSize: "13px" }}
              >
                Edit Details
              </button>
            )}
          </div>
          <p className="subtitle">
            {playlist.description || "No description provided."}
          </p>
          <p className="track-count">{playlist.tracks?.length || 0} songs</p>
        </div>
      </div>

      <div className="tracks-section">
        {playlist.tracks?.length === 0 ? (
          <div className="playlists-empty" style={{ margin: "20px 0" }}>
            <p>This playlist is empty. Go to the Library to add some songs!</p>
          </div>
        ) : (
          <div className="track-list-table">
            <div className="table-header-row">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span>Action</span>
            </div>
            {playlist.tracks?.map((track, index) => (
              <div key={track.music_id} className="track-row">
                <span className="track-index">{index + 1}</span>
                <div className="track-main-info">
                  <span className="track-title-text">{track.title}</span>
                  <span className="track-artist-text">
                    Artist {track.artist_id}
                  </span>
                </div>
                <span className="track-album-text">
                  {track.album_name || "Single Track"}
                </span>
                <div className="track-actions">
                  <button
                    className="control-btn play-btn-inline"
                    onClick={() =>
                      play(
                        {
                          ...track,
                          url: track.uri,
                          artist: `Artist ${track.artist_id}`,
                          album: track.album_name || "Single Track",
                        },
                        playlist.tracks.map((t) => ({
                          ...t,
                          url: t.uri,
                          artist: `Artist ${t.artist_id}`,
                          album: t.album_name || "Single Track",
                        })),
                        index
                      )
                    }
                    title="Play Track"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {isOwner && (
                    <button
                      className="delete-btn-inline"
                      onClick={() => handleRemoveTrack(track.music_id)}
                      title="Remove from playlist"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Playlist Details</h3>
            {editError && (
              <div style={{ color: "#ff453a", marginBottom: "15px", fontSize: "14px" }}>
                {editError}
              </div>
            )}
            <form onSubmit={handleSaveDetails}>
              <div className="modal-form-group">
                <label htmlFor="edit-name">Playlist Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="modal-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              <div className="modal-form-group">
                <label htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  className="modal-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add an optional description"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={updating}>
                  {updating ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
