import { sessionAuthMiddleware } from "../middleware/sessionAuth.js";
import { findArtistId } from "../services/artist.service.js";
import { findUserBySessionId } from "../services/sessions.service.js";
import { createSong, getSongs } from "../services/song.serviec.js";
import { getRequestBody } from "../utils/bodyParse.js";

export async function getSongsController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let artistId = req.query.artist_id ? parseInt(req.query.artist_id) : null;

  if (page < 1 || limit < 1) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Invalid page or limit value" }));
  }

  try {
    const currentUser = await findUserBySessionId(req.sessionId);
    if (currentUser?.role === 'artist') {
      const dbArtist = await findArtistId(currentUser.id);
      if (dbArtist) {
          artistId = dbArtist.id;
      }
    }

    const { getSongs } = await import("../services/song.serviec.js");
    const { songs, pagination } = await getSongs(page, limit, artistId);
    console.log("Retrieved songs:", songs);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ songs, pagination }));
  } catch (error) {
    console.error("Get songs error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function createSongsController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }
  const userId = req.session.user_id;

  try {
    const currentUser = await findUserBySessionId(req.sessionId);
    if (!currentUser || currentUser.role !== "artist") {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Forbidden" }));
    }

    const { id: artistId } = await findArtistId(userId);
    const body = await getRequestBody(req);

    const { title, albumName, genre } = body;

    const songValues = {
      artistId,
      title,
      albumName,
      genre,
    };

    const result = await createSong(songValues);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        song: result,
        message: "Song created successfully",
      })
    );
  } catch (error) {
    console.error("Create song error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function updateSongController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }
  const userId = req.session.user_id;

  try {
    const currentUser = await findUserBySessionId(req.sessionId);
    if (!currentUser || currentUser.role !== "artist") {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Forbidden" }));
    }

    const { id: artistId } = await findArtistId(userId);
    const songId = req.params.id;
    
    const { getSongById, updateSongById } = await import("../services/song.serviec.js");
    const song = await getSongById(songId);
    if (!song) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Song not found" }));
    }
    
    if (song.artist_id !== artistId) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Forbidden: You can only update your own songs" }));
    }

    const body = await getRequestBody(req);
    const { title, albumName, genre } = body;

    const updatedSong = await updateSongById(songId, { title, albumName, genre });

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        song: updatedSong,
        message: "Song updated successfully",
      })
    );
  } catch (error) {
    console.error("Update song error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function deleteSongController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }
  const userId = req.session.user_id;

  try {
    const currentUser = await findUserBySessionId(req.sessionId);
    if (!currentUser || currentUser.role !== "artist") {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Forbidden" }));
    }

    const { id: artistId } = await findArtistId(userId);
    const songId = req.params.id;
    
    const { getSongById, deleteSongById } = await import("../services/song.serviec.js");
    const song = await getSongById(songId);
    if (!song) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Song not found" }));
    }
    
    if (song.artist_id !== artistId) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Forbidden: You can only delete your own songs" }));
    }

    await deleteSongById(songId);

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Song deleted successfully" }));
  } catch (error) {
    console.error("Delete song error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
