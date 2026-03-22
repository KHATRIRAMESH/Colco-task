import { findSessionById } from "../services/sessions.service.js";

export function extractSessionIdFromRequest(req) {
  const cookieHeader = req.headers.cookie || "";

  const sessionCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("session_id="));

  if (!sessionCookie) {
    return null;
  }

  const [, rawSessionId] = sessionCookie.split("=");
  return rawSessionId || null;
}

export async function sessionAuthMiddleware(req, res, next = async () => {}) {
  const sessionId = extractSessionIdFromRequest(req);

  req.sessionId = sessionId;
  req.session = null;
  req.isAuthenticated = false;
  req.userId = null;

  if (sessionId) {
    const session = await findSessionById(sessionId);

    if (session) {
      req.session = session;
      req.isAuthenticated = true;
      req.userId = session.user_id ?? null;
    }
  }

  return next();
}
