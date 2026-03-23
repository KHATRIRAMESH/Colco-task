import { pool } from "../db/dbConnect.js";
import {
  buildUpdateArtistQuery,
  COUNT_ARTISTS_QUERY,
  CREATE_ARTIST_QUERY,
  DELETE_ARTIST_QUERY,
  GET_ARTISTS_QUERY,
} from "../queries/artist.queries.js";
import { camelToSnakeCase } from "../utils/converter.js";

export async function createArtist(values) {
  const result = await pool.query(CREATE_ARTIST_QUERY, values);
  return result.rows[0];
}

export async function deleteArtist(artistId) {
  const result = await pool.query(DELETE_ARTIST_QUERY, [artistId]);
  return result.rowCount > 0;
}

export async function updateArtistById(artistId, updateData) {
  const allowedFields = [
    "name",
    "dob",
    "gender",
    "address",
    "first_release_year",
    "no_of_albums_released",
  ];
  const updates = Object.entries(updateData).filter(
    ([key, value]) =>
      allowedFields.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== "",
  );

  if (updates.length === 0) {
    throw new Error("No valid fields provided for update");
  }
  query;
  const setClause = updates
    .map(([key], index) => `${camelToSnakeCase(key)} = $${index + 1}`)
    .join(", ");
  const values = updates.map(([, value]) => value);
  values.push(artistId);

  const updateQuery = buildUpdateArtistQuery(setClause, values.length);
  const result = await pool.query(updateQuery, values);
  console.log("id for update:", result.rows[0]);
  return result.rows[0];
}

export async function getArtists(page, limit) {
  const offset = (page - 1) * limit;
  const [countResult, artists] = await Promise.all([
    pool.query(COUNT_ARTISTS_QUERY),
    pool.query(GET_ARTISTS_QUERY, [limit, offset]),
  ]);
  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);
  console.log(
    `Total artists: ${total}, Total pages: ${totalPages}, Current page: ${page}, Artists on this page: ${artists.rows.length}`,
  );
  return {
    artists: artists.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function findArtistId(userId) {
  const result = await pool.query(`SELECT id FROM artists WHERE user_id = $1`, [
    userId,
  ]);
  return result.rows[0];
}

export async function getAllArtists() {
  const result = await pool.query("SELECT * FROM artists");
  return result.rows;
}
