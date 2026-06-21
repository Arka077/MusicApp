import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Header.css";

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Display username if available, otherwise user_id
  const displayName = user?.username || user?.name || user?.user_id || "User";

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🎵 Music App
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {isAuthenticated && (
            <>
              {/* User-Only Section */}
              {user?.role === "user" && (
                <>
                  <Link to="/library" className="nav-link">
                    Library
                  </Link>
                  <Link to="/playlists" className="nav-link">
                    Playlists
                  </Link>
                </>
              )}

              {/* Artist-Only Section (3 Clean, Structured Tabs) */}
              {user?.role === "artist" && (
                <>
                  <Link to="/upload" className="nav-link">
                    Upload Songs
                  </Link>
                  <Link to="/artist/songs" className="nav-link">
                    Your Songs
                  </Link>
                  <Link to="/artist/albums" className="nav-link">
                    Your Albums
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="auth-section" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="profile-link-container" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                {user?.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={displayName}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #a78bfa"
                    }}
                  />
                ) : (
                  <div
                    className="avatar-placeholder"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#3a3a3c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#a78bfa",
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-name" style={{ color: "#f5f5f7", fontWeight: "500", fontSize: "14px" }}>
                  {displayName}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
