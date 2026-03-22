export const CREATE_SONG_QUERY = `
        INSERT INTO songs (artist_id, title, album_name, genre)
        VALUES ($1, $2, $3, $4)
        RETURNING *`;

export const GET_SONGS_QUERY = `
       SELECT id, title,genre,artist_id, album_name,created_at
       FROM songs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2
    `;

export const GET_SONG_BY_ARTIST_ID_QUERY = `
        SELECT s.id, s.title, s.genre, s.created_at, a.name AS artist_name
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        WHERE a.id = $1
        ORDER BY s.created_at DESC
    `;

export const COUNT_SONGS_QUERY = `
        SELECT COUNT(*) FROM songs
    `;
