import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMusic } from "../hooks/useMusic";
import { musicService } from "../services/musicService";
import { MusicCard } from "../components/MusicCard";
import "../styles/Home.css";

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { play } = useMusic();
  const navigate = useNavigate();

  const [freshReleases, setFreshReleases] = useState([]);
  const [suggestedAlbums, setSuggestedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadHomeContent();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadHomeContent = async () => {
    try {
      setLoading(true);

      const [songs, albums] = await Promise.all([
        musicService.getLatestMusic().catch(() => []),
        musicService.getAlbums().catch(() => [])
      ]);

      if (songs?.length) {
        setFreshReleases(songs);
      }
      if (albums?.length) {
        setSuggestedAlbums(albums.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to load home content:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-dashboard">
      {/* Hero */}
      <div className="home-hero-banner">
        <div className="hero-banner-content">
          {isAuthenticated && (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={user.username}
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #a78bfa"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#3a3a3c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                    fontWeight: "bold",
                    fontSize: "24px",
                    border: "3px solid #a78bfa"
                  }}
                >
                  {(user?.username || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <h1 style={{ margin: 0 }}>Welcome Back, {user?.username}!</h1>
            </div>
          )}
          {!isAuthenticated && (
            <h1 style={{ marginBottom: "20px" }}>Discover Independent Music</h1>
          )}

          <p>
            {user?.role === "artist"
              ? "Upload tracks, manage albums, and grow your catalog."
              : "Stream music, discover new artists, and build playlists."}
          </p>

          <div className="hero-action-row">
            {isAuthenticated ? (
              user?.role === "artist" ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/upload")}
                  >
                    Upload Track
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/artist/songs")}
                  >
                    My Songs
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/library")}
                  >
                    Open Library
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/playlists")}
                  >
                    My Playlists
                  </button>
                </>
              )
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fresh Releases */}
      {isAuthenticated && (
        <div className="home-stream-section">
          <div className="stream-section-header">
            <h2>Fresh Releases</h2>
            <p>Newest songs uploaded to the platform.</p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : freshReleases.length === 0 ? (
            <p>No songs available.</p>
          ) : (
            <div className="playlists-grid">
              {freshReleases.map((track, index) => (
                <MusicCard
                  key={track.music_id}
                  music={{
                    ...track,
                    artist: `Artist #${track.artist_id}`,
                    album: track.album_id || "Single Track",
                    url: track.uri,
                    image: track.cover_url,
                  }}
                  onPlay={() =>
                    play(
                      {
                        ...track,
                        url: track.uri,
                        artist: `Artist #${track.artist_id}`,
                        album: track.album_id || "Single Track",
                      },
                      freshReleases.map((t) => ({
                        ...t,
                        url: t.uri,
                        artist: `Artist #${t.artist_id}`,
                        album: t.album_id || "Single Track",
                      })),
                      index
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggested Albums */}
      {isAuthenticated && suggestedAlbums.length > 0 && (
        <div className="home-stream-section" style={{ marginTop: "48px" }}>
          <div className="stream-section-header">
            <h2>Suggested Albums</h2>
            <p>Curated collections for your listening style.</p>
          </div>
          <div className="playlists-grid">
            {suggestedAlbums.map((album) => (
              <div
                key={album.album_id}
                className="playlist-item-card"
                onClick={() => navigate(`/artist/albums/${album.album_id}`)}
                style={{
                  background: "#1c1c1e",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #2c2c2e",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.borderColor = "#a78bfa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "#2c2c2e";
                }}
              >
                {album.cover_url ? (
                  <img
                    src={album.cover_url}
                    alt={album.title}
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "12px"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      background: "linear-gradient(135deg, #3a1c5c 0%, #1a102f 100%)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#a78bfa",
                      marginBottom: "12px"
                    }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
                    </svg>
                  </div>
                )}
                <h4 style={{ color: "#fff", margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>{album.title}</h4>
                <span style={{ fontSize: "12px", color: "#86868b" }}>Album Collection</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
