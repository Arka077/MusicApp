import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useMusic } from "../hooks/useMusic";
import { useAuth } from "../hooks/useAuth";
import { musicService } from "../services/musicService";
import "../styles/Playlists.css";

export const AlbumDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { play } = useMusic();
  const { user } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    apiClient
      .get(`/music/album/${id}`)
      .then((res) => {
        setAlbum(res.data.album);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const isOwner = user && album && (String(album.artist_id) === String(user.id || user.user_id));

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError("Album title is required");
      return;
    }
    try {
      setUpdating(true);
      setEditError("");

      const formData = new FormData();
      formData.append("title", editTitle.trim());
      if (editCoverFile) {
        formData.append("file", editCoverFile);
      }

      const updatedAlbum = await musicService.updateAlbum(id, formData);
      setAlbum({
        ...album,
        title: updatedAlbum.title,
        cover_url: updatedAlbum.cover_url || album.cover_url,
      });
      setIsEditModalOpen(false);
      setEditCoverFile(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update album details");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromAlbum = async (musicId) => {
    if (!window.confirm("Are you sure you want to remove this song from the album? It will become a standalone single.")) {
      return;
    }
    try {
      await musicService.removeSongFromAlbum(musicId);
      setAlbum({
        ...album,
        tracks: album.tracks.filter((t) => t.music_id !== musicId),
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove song from album");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="playlist-container">
        <h2>Loading Album...</h2>
      </div>
    );
  if (!album)
    return (
      <div className="playlist-container">
        <h2>Album Not Found</h2>
      </div>
    );

  return (
    <div className="playlist-container">
      <button
        className="btn btn-secondary"
        onClick={() => navigate("/artist/albums")}
        style={{ marginBottom: "20px" }}
      >
        ← Back to Albums
      </button>

      <div className="playlist-detail-header">
        {album.cover_url ? (
          <img
            src={album.cover_url}
            alt={album.title}
            style={{
              width: "180px",
              height: "180px",
              objectFit: "cover",
              borderRadius: "6px",
            }}
          />
        ) : (
          <div
            style={{
              width: "180px",
              height: "180px",
              background: "linear-gradient(135deg, #3a1c5c 0%, #1a102f 100%)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a78bfa",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
        )}
        <div className="playlist-detail-meta">
          <span
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#667eea",
              fontWeight: "bold",
            }}
          >
            Album Catalog
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <h2>{album.title}</h2>
            {isOwner && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditTitle(album.title);
                  setEditCoverFile(null);
                  setEditError("");
                  setIsEditModalOpen(true);
                }}
                style={{ padding: "6px 12px", fontSize: "13px" }}
              >
                Edit Details
              </button>
            )}
          </div>
          <p style={{ color: "#aaa" }}>
            {album.tracks?.length || 0} tracks compiled
          </p>
        </div>
      </div>

      <div className="track-list-table">
        <div className="table-header-row">
          <span>#</span>
          <span>Title</span>
          <span></span>
          <span>Actions</span>
        </div>
        {album.tracks && album.tracks.length === 0 ? (
          <div style={{ padding: "20px", color: "#555", fontStyle: "italic" }}>
            No tracks currently assigned to this album container.
          </div>
        ) : (
          album.tracks?.map((track, i) => (
            <div key={track.music_id} className="track-row">
              <span>{i + 1}</span>
              <div>
                <span
                  className="track-title-text"
                  style={{ color: "#fff", fontWeight: "500" }}
                >
                  {track.title}
                </span>
              </div>
              <span></span>
              <div className="track-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  className="btn-play"
                  onClick={() =>
                    play(
                      { ...track, url: track.uri, artist: "You" },
                      album.tracks.map((t) => ({ ...t, url: t.uri, artist: "You" })),
                      i
                    )
                  }
                  title="Play track"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                {isOwner && (
                  <button
                    className="delete-btn-inline"
                    onClick={() => handleRemoveFromAlbum(track.music_id)}
                    title="Remove from Album"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ff453a",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 69, 58, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18.36 6.64a9 9 0 0 1-.3 12.03l-1.42-1.42a7 7 0 0 0 .1-9.2l1.42-1.42Z" />
                      <path d="M5.64 17.36a9 9 0 0 1 .3-12.03l1.42 1.42a7 7 0 0 0-.1 9.2l-1.42 1.42Z" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Album Details</h3>
            {editError && (
              <div style={{ color: "#ff453a", marginBottom: "15px", fontSize: "14px" }}>
                {editError}
              </div>
            )}
            <form onSubmit={handleSaveDetails} encType="multipart/form-data">
              <div className="modal-form-group">
                <label htmlFor="edit-title">Album Title</label>
                <input
                  id="edit-title"
                  type="text"
                  className="modal-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter album title"
                  required
                />
              </div>
              <div className="modal-form-group" style={{ marginTop: "15px" }}>
                <label htmlFor="edit-cover">Album Cover Image (Optional)</label>
                <input
                  id="edit-cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files[0])}
                  style={{ marginTop: "5px" }}
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
