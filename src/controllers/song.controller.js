import { sessionAuthMiddleware } from "../middleware/sessionAuth.js";
import { findArtistId } from "../services/artist.service.js";
import { findUserBySessionId } from "../services/sessions.service.js";
import { createSong, getSongs } from "../services/song.serviec.js";
import { getRequestBody } from "../utils/bodyParse.js";

export async function getSongsController(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Invalid page or limit value" }));
  }
  try {
    const { songs, pagination } = await getSongs(page, limit);
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
  const userId = req.session.user_id;
  console.log("Authenticated user ID:", userId);

  try {
    const currentUser = await findUserBySessionId(req.sessionId);
    if (!currentUser || currentUser.role !== "artist") {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Forbidden" }));
    }

    const { id: artistId } = await findArtistId(userId);
    console.log("Artist ID for user ID:", artistId);
    const body = await getRequestBody(req);

    const { title, albumName, genre } = body;

    const songValues = {
      artistId,
      title,
      albumName,
      genre,
    };

    const result = await createSong(songValues);

    console.log("Received song creation request with body:", result);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        songs: result,
        message: "Create song functionality not implemented yet",
      }),
    );
  } catch (error) {
    console.error("Create song error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
