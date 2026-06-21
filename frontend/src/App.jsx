import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MusicProvider } from "./context/MusicContext";
import { useAuth } from "./hooks/useAuth";
import { Header } from "./components/Header";
import { MusicPlayer } from "./components/MusicPlayer";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Core View Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Library } from "./pages/Library";
import { Upload } from "./pages/Upload";

// Playlist View Subsystem
import { YourPlaylists } from "./pages/YourPlaylists";
import { CreatePlaylist } from "./pages/CreatePlaylist";
import { PlaylistDetails } from "./pages/PlaylistDetails";

// Artist Operational Dashboards
import { YourSongs } from "./pages/YourSongs";
import { YourAlbums } from "./pages/YourAlbums";
import { ArtistCreateAlbum } from "./pages/ArtistCreateAlbum";
import { AlbumDetails } from "./pages/AlbumDetails";
import { Profile } from "./pages/Profile";

import "./App.css";
import "./styles/global.css";

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header />
      <Routes>
        {/* Public Access Paths */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Core Routes */}
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <YourPlaylists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/new"
          element={
            <ProtectedRoute>
              <CreatePlaylist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/:id"
          element={
            <ProtectedRoute>
              <PlaylistDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Artist Target Operational Gateways */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/songs"
          element={
            <ProtectedRoute>
              <YourSongs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/albums"
          element={
            <ProtectedRoute>
              <YourAlbums />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/albums/create"
          element={
            <ProtectedRoute>
              <ArtistCreateAlbum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/albums/new"
          element={
            <ProtectedRoute>
              <ArtistCreateAlbum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/albums/:id"
          element={
            <ProtectedRoute>
              <AlbumDetails />
            </ProtectedRoute>
          }
        />
      </Routes>

      {isAuthenticated && <MusicPlayer />}
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </AuthProvider>
    </Router>
  );
}
