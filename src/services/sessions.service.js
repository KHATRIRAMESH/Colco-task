import { pool } from "../db/dbConnect.js";
import {
  DELETE_SESSION_BY_ID_QUERY,
  FIND_SESSION_BY_ID_QUERY,
  FIND_USER_BY_SESSION_ID_QUERY,
  INSERT_SESSION_QUERY,
} from "../queries/session.queries.js";

export async function findSessionById(sessionId) {
  const result = await pool.query(FIND_SESSION_BY_ID_QUERY, [sessionId]);
  return result.rows[0] || null;
}

export async function createUserSession(sessionId, userId) {
  const result = await pool.query(INSERT_SESSION_QUERY, [sessionId, userId]);
  return result.rows[0];
}

export async function deleteSessionById(sessionId) {
  const result = await pool.query(DELETE_SESSION_BY_ID_QUERY, [sessionId]);
  return result.rows[0] || null;
}

export async function findUserBySessionId(sessionId) {
  const result = await pool.query(FIND_USER_BY_SESSION_ID_QUERY, [sessionId]);
  return result.rows[0] || null;
}
