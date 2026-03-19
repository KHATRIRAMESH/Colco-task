import { getRequestBody } from "../utils/bodyParse.js";
import { sessionAuthMiddleware } from "../middleware/sessionAuth.js";
import {
  createUserSession,
  deleteSessionById,
  findUserByEmail,
  insertRegisteredUser,
} from "../services/user.js";
import crypto from "crypto";
import { hashPassword, verifyPassword } from "../utils/hashPassword.js";

export async function registerUserController(req, res) {
  try {
    const body = await getRequestBody(req);

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      address,
      role,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Missing required fields" }));
    }

    const genderMap = {
      male: "m",
      female: "f",
      other: "o",
    };

    const normalizedGender = gender
      ? genderMap[String(gender).toLowerCase()]
      : null;
    if (gender && !normalizedGender) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid gender value" }));
    }

    const normalizedRole = role || "super_admin";

    const { salt, hash: hashedPassword } = hashPassword(password);
    console.log(
      `Salt ${salt}, and hashed password generated for registration:  ${hashedPassword}`,
    );

    const user = await insertRegisteredUser({
      firstName,
      lastName,
      email,
      salt,
      password: hashedPassword,
      phone,
      gender: normalizedGender,
      address,
      role: normalizedRole,
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Registration successful",
        user,
      }),
    );
  } catch (error) {
    if (error.code === "23505") {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Email already exists" }));
    }

    if (error.code === "22P02") {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid input format" }));
    }

    console.error("Registration error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function logInUserController(req, res) {
  try {
    const body = await getRequestBody(req);
    const { email, password } = body;

    console.log("Login attempt with email:", email, password);

    if (!email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ message: "Email and password are required" }),
      );
    }

    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(password, user.password, user.salt)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid email or password" }));
    }

    const sessionId = crypto.randomUUID();
    await createUserSession(sessionId, user.id);

    const cookie = `session_id=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`;

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    });
    res.end(
      JSON.stringify({
        message: "Login successful",
        user: {
          id: user.id,
          firstName: user.first_name,
          email: user.email,
          role: user.role,
        },
      }),
    );
  } catch (error) {
    console.error("Login error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function logOutUserController(req, res) {
  await sessionAuthMiddleware(req, res);

  const clearCookie = "session_id=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax";

  if (!req.sessionId) {
    res.writeHead(401, {
      "Content-Type": "application/json",
      "Set-Cookie": clearCookie,
    });
    return res.end(JSON.stringify({ message: "No active session found" }));
  }

  if (!req.isAuthenticated) {
    res.writeHead(401, {
      "Content-Type": "application/json",
      "Set-Cookie": clearCookie,
    });
    return res.end(
      JSON.stringify({ message: "Session is invalid or expired" }),
    );
  }

  await deleteSessionById(req.sessionId);

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Set-Cookie": clearCookie,
  });
  return res.end(JSON.stringify({ message: "Logout successful" }));
}
