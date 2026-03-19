import { pool } from "../db/dbConnect.js";

export async function insertRegisteredUser({
  firstName,
  lastName,
  email,
  salt,
  password,
  phone,
  gender,
  address,
  role,
}) {
  const insertUserQuery = `
        INSERT INTO users (first_name, last_name, email, salt, password, phone, gender, address, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, first_name, last_name, email, phone, gender, address, role, created_at
    `;

  const values = [
    firstName,
    lastName,
    email,
    salt,
    password,
    phone || null,
    gender || null,
    address || null,
    role,
  ];

  const result = await pool.query(insertUserQuery, values);
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const findUserQuery = `
        SELECT id, email, salt, password, role, first_name
        FROM users
        WHERE email = $1
        LIMIT 1
    `;

  const result = await pool.query(findUserQuery, [
    String(email).trim().toLowerCase(),
  ]);
  return result.rows[0] || null;
}

export async function createUserSession(sessionId, userId) {
  const insertSessionQuery = `
        INSERT INTO sessions (id, user_id)
        VALUES ($1, $2)
        RETURNING id, user_id, created_at
    `;

  const result = await pool.query(insertSessionQuery, [sessionId, userId]);
  return result.rows[0];
}

export async function findSessionById(sessionId) {
  const query = `
        SELECT id, user_id, created_at
        FROM sessions
        WHERE id = $1
        LIMIT 1
    `;

  const result = await pool.query(query, [sessionId]);
  return result.rows[0] || null;
}

export async function deleteSessionById(sessionId) {
  const deleteQuery = `
        DELETE FROM sessions
        WHERE id = $1
        RETURNING id, user_id
    `;

  const result = await pool.query(deleteQuery, [sessionId]);
  return result.rows[0] || null;
}

export async function findUserBySessionId(sessionId) {
  const query = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.role
        FROM sessions s
        INNER JOIN users u ON u.id = s.user_id
        WHERE s.id = $1
        LIMIT 1
    `;

  const result = await pool.query(query, [sessionId]);
  return result.rows[0] || null;
}
