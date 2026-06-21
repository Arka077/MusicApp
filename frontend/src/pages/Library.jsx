import React, { useState, useEffect } from "react";
import { musicService } from "../services/musicService";
import { searchService as searchService } from "../services/searchService";
import { useMusic } from "../hooks/useMusic";
import { MusicCard } from "../components/MusicCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import "../styles/Library.css";

export const Library = () => {
  const [music, setMusic] = useState([]);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Normal search state
  const [searchQuery, setSearchQuery] = useState("");

  // AI search state — completely separate
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSearched, setAiSearched] = useState(false);

  const { play, addToPlaylist } = useMusic();

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      const data = await musicService.getAllMusic();
      setMusic(data);
      setFilteredMusic(data);
    } catch (err) {
      setError("Failed to load music");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Normal database search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredMusic(music);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const results = await musicService.getAllMusic(searchQuery.trim());
      setFilteredMusic(results);
    } catch (err) {
      setError("Failed to search music in database");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredMusic(music);
  };

  // AI search — hits ml_service via Node.js
  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    try {
      setAiLoading(true);
      setAiError("");
      setAiSearched(true);
      const results = await searchService.searchByQuery(aiQuery.trim());
      setAiResults(results);
    } catch (err) {
      setAiError("AI search failed. Please try again.");
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearAiSearch = () => {
    setAiQuery("");
    setAiResults([]);
    setAiSearched(false);
    setAiError("");
  };

  const normalizeTrack = (track) => ({
    ...track,
    artist: track.artist_name || `Artist ${track.artist_id}`,
    album: track.album_id || "Single Track",
    url: track.uri,
    image: track.cover_url,
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="library">
      {/* ── AI SEARCH SECTION ─────────────────────────── */}
      <div className="ai-search-wrapper">
        <div className="ai-search-badge">✦ AI Search</div>
        <p className="ai-search-subtitle">
          Describe the music you're looking for in plain words
        </p>
        <form onSubmit={handleAiSearch} className="ai-search-form">
          <div className="ai-search-input-wrapper">
            <span className="ai-search-icon">⌕</span>
            <input
              type="text"
              className="ai-search-input"
              placeholder='Try "calm piano music" or "energetic hip hop beats"'
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
            />
            {aiQuery && (
              <button
                type="button"
                className="ai-search-clear"
                onClick={handleClearAiSearch}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="ai-search-btn"
            disabled={aiLoading || !aiQuery.trim()}
          >
            {aiLoading ? (
              <span className="ai-btn-loading">
                <span className="ai-spinner" />
                Searching...
              </span>
            ) : (
              "Search with AI"
            )}
          </button>
        </form>

        {/* AI Results */}
        {aiSearched && !aiLoading && (
          <div className="ai-results-section">
            {aiError && (
              <Alert
                type="error"
                message={aiError}
                onClose={() => setAiError("")}
              />
            )}
            {!aiError && aiResults.length === 0 && (
              <div className="ai-empty-state">
                <p>No matches found. Try a different description.</p>
              </div>
            )}
            {aiResults.length > 0 && (
              <>
                <div className="ai-results-header">
                  <span className="ai-results-label">
                    ✦ {aiResults.length} AI matches for "{aiQuery}"
                  </span>
                  <button
                    className="ai-results-clear-btn"
                    onClick={handleClearAiSearch}
                  >
                    Clear results
                  </button>
                </div>
                <div className="music-grid">
                  {aiResults.map((track, index) => (
                    <MusicCard
                      key={`ai-${track.music_id}`}
                      music={normalizeTrack(track)}
                      onPlay={() =>
                        play(
                          normalizeTrack(track),
                          aiResults.map(normalizeTrack),
                          index,
                        )
                      }
                      onAddToPlaylist={() =>
                        addToPlaylist(normalizeTrack(track))
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── DIVIDER ───────────────────────────────────── */}
      <div className="library-divider">
        <span>or browse all music</span>
      </div>

      {/* ── NORMAL LIBRARY SECTION ────────────────────── */}
      <div className="library-header">
        <h2>Music Library</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {filteredMusic.length === 0 ? (
        <div className="empty-state">
          <p>
            {searchQuery
              ? "No music found matching your search"
              : "No music available"}
          </p>
        </div>
      ) : (
        <div className="music-grid">
          {filteredMusic.map((track, index) => (
            <MusicCard
              key={track.music_id}
              music={normalizeTrack(track)}
              onPlay={() =>
                play(
                  normalizeTrack(track),
                  filteredMusic.map(normalizeTrack),
                  index,
                )
              }
              onAddToPlaylist={() => addToPlaylist(normalizeTrack(track))}
            />
          ))}
        </div>
      )}
    </div>
  );
};
