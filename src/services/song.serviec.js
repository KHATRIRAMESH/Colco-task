import { pool } from "../db/dbConnect.js";
import {
  COUNT_SONGS_QUERY,
  CREATE_SONG_QUERY,
  GET_SONGS_QUERY,
} from "../queries/song.queries.js";

export async function createSong(songValues) {
  const result = await pool.query(CREATE_SONG_QUERY, [
    songValues.artistId,
    songValues.title,
    songValues.albumName,
    songValues.genre,
  ]);
  return result.rows[0];
}

export async function getSongs(page, limit, artistId = null) {
  const offset = (page - 1) * limit;

  let query = GET_SONGS_QUERY;
  let countQuery = COUNT_SONGS_QUERY;
  let params = [limit, offset];
  let countParams = [];

  if (artistId) {
    query = `
       SELECT id, title,genre,artist_id, album_name,created_at
       FROM songs
       WHERE artist_id = $3
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2
    `;
    countQuery = `SELECT COUNT(*) FROM songs WHERE artist_id = $1`;
    params.push(artistId);
    countParams.push(artistId);
  }

  const result = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, countParams),
  ]);

  return {
    songs: result[0].rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(parseInt(result[1].rows[0].count) / limit),
    },
  };
}

export async function getSongById(songId) {
  const result = await pool.query("SELECT * FROM songs WHERE id = $1", [songId]);
  return result.rows[0];
}

export async function updateSongById(songId, updateData) {
  const allowedFields = ["title", "albumName", "genre"];
  const updates = Object.entries(updateData).filter(
    ([key, value]) => allowedFields.includes(key) && value !== undefined && value !== null && value !== ""
  );

  if (updates.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const setClause = updates
    .map(([key], index) => {
       const snakeKey = key === 'albumName' ? 'album_name' : key;
       return `${snakeKey} = $${index + 1}`;
    })
    .join(", ");
    
  const values = updates.map(([, value]) => value);
  values.push(songId);

  const query = `UPDATE songs SET ${setClause} WHERE id = $${values.length} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteSongById(songId) {
  const result = await pool.query("DELETE FROM songs WHERE id = $1", [songId]);
  return result.rowCount > 0;
}
