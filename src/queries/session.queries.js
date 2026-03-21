export const INSERT_SESSION_QUERY = `
        INSERT INTO sessions (id, user_id)
        VALUES ($1, $2)
        RETURNING id, user_id, created_at
    `;

export const FIND_SESSION_BY_ID_QUERY = `
        SELECT id, user_id, created_at
        FROM sessions
        WHERE id = $1
        LIMIT 1
    `;

export const DELETE_SESSION_BY_ID_QUERY = `
        DELETE FROM sessions
        WHERE id = $1
        RETURNING id,user_id
    `;

export const FIND_USER_BY_SESSION_ID_QUERY = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.role
        FROM sessions s
        INNER JOIN users u ON u.id = s.user_id
        WHERE s.id = $1
        LIMIT 1
    `;
