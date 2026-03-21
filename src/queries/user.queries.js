export const CREATE_USER_QUERY = `
        INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, first_name, last_name, email, phone, dob, gender, address, role, created_at
    `;

export const FIND_USER_QUERY = `
        SELECT id, email, password, role, first_name
        FROM users
        WHERE email = $1
        LIMIT 1
        `;

export const GET_USERS_QUERY = `
        SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $1
    `;

export const COUNT_USERS_QUERY = `
        SELECT COUNT(*) FROM users
    `;

export function buildUpdateUserQuery(setClause, lastIndex) {
  return `
    UPDATE users
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${lastIndex}
    RETURNING *
  `;
}
export const DELETE_USER_QUERY = `
        DELETE FROM users
        WHERE id = $1
    `;
