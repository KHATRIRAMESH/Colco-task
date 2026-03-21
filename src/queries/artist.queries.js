export const CREATE_ARTIST_QUERY = `
      INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at
    `;
