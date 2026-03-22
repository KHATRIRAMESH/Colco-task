export const CREATE_ARTIST_QUERY = `
      INSERT INTO artists (user_id, name, dob, gender, address, first_release_year, no_of_albums_released)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id,user_id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at
    `;

export const GET_ARTISTS_QUERY = `
          SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at
          FROM artists
          ORDER BY id DESC
          LIMIT $1 OFFSET $2
        `;

export const GET_ARTIST_BY_ID_QUERY = `
          SELECT * from artists
          WHERE id = $1
        `;

export const DELETE_ARTIST_QUERY = `
          DELETE FROM artists
          WHERE id = $1
        `;

export function buildUpdateArtistQuery(setClause, lastIndex) {
  return `
    UPDATE artists
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${lastIndex}
    RETURNING *
  `;
}

export const COUNT_ARTISTS_QUERY = `
          SELECT COUNT(*) FROM artists
        `;
