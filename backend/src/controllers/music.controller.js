const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const playlistModel = require("../models/playlist.model");
const { uploadFile } = require("../services/storage.service");
const db = require("../db/db"); // Imported for direct transactional updates
const mlService = require("../services/ml.service");
/**
 * Uploads a track profile and automatically creates/links an album container if a name is provided
 */
async function createMusic(req, res) {
  try {
    const user = req.user;
    const { title, album_name } = req.body;
    
    const file = req.files && req.files["file"] ? req.files["file"][0] : null;
    const coverFile = req.files && req.files["cover"] ? req.files["cover"][0] : null;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!file) {
      return res.status(400).json({ message: "Music file is required" });
    }

    const artistId = user.id || user.user_id;
    let targetAlbumId = null;

    if (album_name && album_name.trim() !== "") {
      const cleanAlbumName = album_name.trim();
      let album = await albumModel.findByTitleAndArtist(
        cleanAlbumName,
        artistId,
      );

      if (!album) {
        album = await albumModel.create({
          title: cleanAlbumName,
          cover_url: null,
          artist_id: artistId,
        });
      }
      targetAlbumId = album.album_id;
    }

    const uploadResult = await uploadFile(file);
    let coverUrl = null;
    if (coverFile) {
      const coverUploadResult = await uploadFile(coverFile);
      coverUrl = coverUploadResult.url;
    }

    const music = await musicModel.create({
      uri: uploadResult.url,
      title,
      cover_url: coverUrl,
      artist_id: artistId,
      album_id: targetAlbumId,
    });

    mlService.indexSong(music.music_id, music.uri).catch((err) => {
      console.error(
        `[ML] Background indexing failed for song ${music.music_id}:`,
        err.message,
      );
    });


    return res.status(201).json({
      message: "Music uploaded successfully",
      music,
    });
  } catch (error) {
    console.error("Create music error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Compiles a new album structure and claims ownership of unassigned songs
 */
async function createAlbum(req, res) {
  try {
    const user = req.user;
    const { title, music_ids } = req.body;
    const file = req.file;
    let parsedMusicIds = [];

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const artistId = user.id || user.user_id;

    if (music_ids) {
      try {
        parsedMusicIds = Array.isArray(music_ids)
          ? music_ids
          : JSON.parse(music_ids);
        if (!Array.isArray(parsedMusicIds)) throw new Error();
      } catch {
        return res.status(400).json({
          message:
            "music_ids must be a array or a valid JSON array format, e.g. [1,2,3]",
        });
      }

      if (parsedMusicIds.length > 0) {
        const uniqueMusicIds = [...new Set(parsedMusicIds)];
        const existingMusic = await musicModel.findByIds(uniqueMusicIds);

        if (existingMusic.length !== uniqueMusicIds.length) {
          const existingIds = new Set(
            existingMusic.map(({ music_id }) => music_id),
          );
          const missingIds = uniqueMusicIds.filter(
            (musicId) => !existingIds.has(musicId),
          );

          return res.status(400).json({
            message: "One or more music_ids do not exist within global records",
            missing_music_ids: missingIds,
          });
        }
        parsedMusicIds = uniqueMusicIds;
      }
    }

    let coverUrl = null;
    if (file) {
      const uploadResult = await uploadFile(file);
      coverUrl = uploadResult.url;
    }

    const album = await albumModel.create({
      title,
      cover_url: coverUrl,
      artist_id: artistId,
    });

    if (parsedMusicIds.length > 0) {
      const updateQuery = `
        UPDATE music 
        SET album_id = ? 
        WHERE music_id IN (${parsedMusicIds.map(() => "?").join(",")}) AND artist_id = ?
      `;
      await db.execute(updateQuery, [
        album.album_id,
        ...parsedMusicIds,
        artistId,
      ]);
    }

    return res.status(201).json({
      message: "Album created successfully",
      album,
      songs_added: parsedMusicIds.length,
    });
  } catch (error) {
    console.error("Create album error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Gathers every song profile uploaded by the authenticated artist
 */
async function getArtistSongs(req, res) {
  try {
    const artistId = req.user.id || req.user.user_id;

    const query = `
      SELECT m.*, a.title AS album_name 
      FROM music m
      LEFT JOIN albums a ON m.album_id = a.album_id
      WHERE m.artist_id = ? 
      ORDER BY m.music_id DESC
    `;
    const [songs] = await db.execute(query, [artistId]);

    return res.status(200).json({
      message: "Artist songs retrieved successfully",
      songs,
    });
  } catch (error) {
    console.error("Get artist songs error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch songs", error: error.message });
  }
}
async function getArtistAlbums(req, res) {
  try {
    const artistId = req.user.id || req.user.user_id;
    const query =
      "SELECT * FROM albums WHERE artist_id = ? ORDER BY album_id DESC";
    const [albums] = await db.execute(query, [artistId]);

    return res.status(200).json({
      message: "Artist albums retrieved successfully",
      albums,
    });
  } catch (error) {
    console.error("Get artist albums error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch albums", error: error.message });
  }
}

/**
 * Gathers tracks uploaded by the artist that do not belong to any album container yet
 */
async function getUnassignedSongs(req, res) {
  try {
    const artistId = req.user.id || req.user.user_id;
    const query =
      "SELECT * FROM music WHERE artist_id = ? AND album_id IS NULL ORDER BY music_id DESC";
    const [songs] = await db.execute(query, [artistId]);

    return res.status(200).json({
      message: "Unassigned singles retrieved successfully",
      songs,
    });
  } catch (error) {
    console.error("Get unassigned songs error:", error);
    return res
      .status(500)
      .json({
        message: "Failed to fetch unassigned songs",
        error: error.message,
      });
  }
}

/**
 * Returns a collection layout array of all songs inside the system
 */
async function getAllMusics(req, res) {
  try {
    const { search } = req.query;

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      const query = `
        SELECT m.music_id, m.uri, m.title, m.cover_url, m.artist_id, m.album_id, m.created_at, u.username AS artist_name
        FROM music m
        LEFT JOIN users u ON m.artist_id = u.user_id
        WHERE m.title LIKE ? OR u.username LIKE ?
        ORDER BY m.created_at DESC
      `;
      const [musics] = await db.query(query, [searchTerm, searchTerm]);
      return res.status(200).json({
        message: "Musics searched successfully",
        count: musics.length,
        musics,
      });
    }

    const limit = parseInt(req.query.limit) || 30;
    const query = `
      SELECT m.music_id, m.uri, m.title, m.cover_url, m.artist_id, m.album_id, m.created_at, u.username AS artist_name
      FROM music m
      LEFT JOIN users u ON m.artist_id = u.user_id
      ORDER BY RAND()
      LIMIT ?
    `;
    const [musics] = await db.query(query, [limit]);

    return res.status(200).json({
      message: "Musics retrieved successfully",
      count: musics.length,
      musics,
    });
  } catch (error) {
    console.error("Get all musics error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Returns a collection layout array of all albums inside the system
 */
async function getAllAlbums(req, res) {
  try {
    const albums = await albumModel.findAll();
    return res.status(200).json({
      message: "Albums retrieved successfully",
      albums,
    });
  } catch (error) {
    console.error("Get all albums error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Gathers details for an album container using a parameter lookup id
 */
async function getAlbumById(req, res) {
  try {
    const { id } = req.params;
    const album = await albumModel.findById(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const tracks = await albumModel.getAlbumSongs(id);

    return res.status(200).json({
      message: "Album retrieved successfully",
      album: {
        ...album,
        tracks: tracks,
      },
    });
  } catch (error) {
    console.error("Get album by ID error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Gathers details for an individual track using a parameter lookup id
 */
async function getMusicById(req, res) {
  try {
    const { id } = req.params;
    const music = await musicModel.findById(id);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    return res.status(200).json({
      message: "Music retrieved successfully",
      music,
    });
  } catch (error) {
    console.error("Get music by ID error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Instantiates a new custom user playlist object row
 */
async function createPlaylist(req, res) {
  try {
    const user = req.user;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const loggedInUserId = user.id || user.user_id;

    const playlist = await playlistModel.create({
      name,
      description,
      user_id: loggedInUserId,
    });

    return res.status(201).json({
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error("Create playlist error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Inserts a track mapping inside a user's playlist (Many-to-Many Bridge)
 */
async function addToPlaylist(req, res) {
  try {
    const user = req.user;
    const { playlist_id, music_id } = req.body;

    console.log("--- ADD TO PLAYLIST DEBUG ---");
    console.log("Received Body:", { playlist_id, music_id });
    console.log("User JWT Payload:", user);

    const playlist = await playlistModel.findById(playlist_id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const loggedInUserId = user.id || user.user_id;

    if (String(playlist.user_id) !== String(loggedInUserId)) {
      return res.status(403).json({
        message: "You are not the owner of this playlist",
      });
    }

    const alreadyExists = await playlistModel.hasSong(playlist_id, music_id);
    if (alreadyExists) {
      return res.status(400).json({
        message: "This song is already in this playlist!",
      });
    }

    await playlistModel.addSong(playlist_id, music_id);

    return res.status(200).json({
      message: "Music added to playlist successfully",
    });
  } catch (error) {
    console.error("Add to playlist database error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function getLatestMusics(req, res) {
  const musics = await musicModel.findLatest(10);

  res.status(200).json({
    musics,
  });
}

async function removeFromPlaylist(req, res) {
  try {
    const user = req.user;
    const { playlist_id, music_id } = req.body;

    const playlist = await playlistModel.findById(playlist_id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const loggedInUserId = user.id || user.user_id;

    if (String(playlist.user_id) !== String(loggedInUserId)) {
      return res.status(403).json({
        message: "You are not the owner of this playlist",
      });
    }

    await playlistModel.removeSong(playlist_id, music_id);

    return res.status(200).json({
      message: "Music removed from playlist successfully",
    });
  } catch (error) {
    console.error("Remove from playlist error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function updatePlaylist(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const playlist = await playlistModel.findById(id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const loggedInUserId = user.id || user.user_id;

    if (String(playlist.user_id) !== String(loggedInUserId)) {
      return res.status(403).json({
        message: "You are not the owner of this playlist",
      });
    }

    await playlistModel.update(id, { name, description });

    return res.status(200).json({
      message: "Playlist updated successfully",
      playlist: {
        ...playlist,
        name,
        description,
      },
    });
  } catch (error) {
    console.error("Update playlist error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function deleteMusic(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const artistId = user.id || user.user_id;

    const music = await musicModel.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    if (String(music.artist_id) !== String(artistId)) {
      return res.status(403).json({ message: "You are not the owner of this song" });
    }

    await musicModel.remove(id);

    return res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Delete music error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

async function removeSongFromAlbum(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const artistId = user.id || user.user_id;

    const music = await musicModel.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    if (String(music.artist_id) !== String(artistId)) {
      return res.status(403).json({ message: "You are not the owner of this song" });
    }

    await musicModel.removeSongFromAlbum(id);

    return res.status(200).json({ message: "Song removed from album successfully" });
  } catch (error) {
    console.error("Remove song from album error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

async function updateAlbum(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: "Album title is required" });
    }

    const album = await albumModel.findById(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const artistId = user.id || user.user_id;

    if (String(album.artist_id) !== String(artistId)) {
      return res.status(403).json({
        message: "You are not the owner of this album",
      });
    }

    let coverUrl = album.cover_url;
    if (file) {
      const uploadResult = await uploadFile(file);
      coverUrl = uploadResult.url;
    }

    await albumModel.update(id, { title, cover_url: coverUrl });

    return res.status(200).json({
      message: "Album updated successfully",
      album: {
        ...album,
        title,
        cover_url: coverUrl,
      },
    });
  } catch (error) {
    console.error("Update album error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function updateMusic(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;

    const music = await musicModel.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    const artistId = user.id || user.user_id;
    if (String(music.artist_id) !== String(artistId)) {
      return res.status(403).json({ message: "You are not the owner of this song" });
    }

    let updatedTitle = music.title;
    if (title && title.trim() !== "") {
      updatedTitle = title.trim();
    }

    let coverUrl = music.cover_url;
    if (file) {
      const uploadResult = await uploadFile(file);
      coverUrl = uploadResult.url;
    }

    await musicModel.update(id, {
      uri: music.uri,
      title: updatedTitle,
      cover_url: coverUrl,
      artist_id: music.artist_id,
      album_id: music.album_id,
    });

    return res.status(200).json({
      message: "Music updated successfully",
      music: {
        ...music,
        title: updatedTitle,
        cover_url: coverUrl,
      },
    });
  } catch (error) {
    console.error("Update music error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  createMusic,
  createAlbum,
  getArtistSongs,
  getUnassignedSongs,
  getAllMusics,
  getMusicById,
  getAllAlbums,
  getAlbumById,
  createPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  updatePlaylist,
  getArtistAlbums,
  getLatestMusics,
  deleteMusic,
  removeSongFromAlbum,
  updateAlbum,
  updateMusic,
};
