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

export async function getSongs(page, limit) {
  const offset = (page - 1) * limit;
  const result = await Promise.all([
    pool.query(GET_SONGS_QUERY, [limit, offset]),
    pool.query(COUNT_SONGS_QUERY),
  ]);

  return {
    songs: result[0].rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(parseInt(result[1].rows[0].count) / limit),
      totalItems: parseInt(result[1].rows[0].count),
    },
  };
}
