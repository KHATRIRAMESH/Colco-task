import { getRequestBody } from "../utils/bodyParse.js";
import {
  logInUserController,
  logOutUserController,
  registerUserController,
} from "../controllers/userController.js";
import { sessionAuthMiddleware } from "../middleware/sessionAuth.js";
import { pool } from "../db/dbConnect.js";
import { findUserBySessionId, insertRegisteredUser } from "../services/user.js";

export async function getUsers(req, res) {
  try {
    const query = `
            SELECT id, first_name, last_name, email, phone, gender,address, role, created_at
            FROM users
            ORDER BY created_at DESC
        `;

    const result = await pool.query(query);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ users: result.rows }));
  } catch (error) {
    console.error("Get users error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function createUser(req, res) {
  try {
    await sessionAuthMiddleware(req, res);

    if (!req.isAuthenticated || !req.sessionId) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Unauthorized" }));
    }

    const currentUser = await findUserBySessionId(req.sessionId);
    if (!currentUser || currentUser.role !== "super_admin") {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          message: "Only super_admin can create artist_manager users",
        }),
      );
    }

    const body = await getRequestBody(req);
    const { firstName, lastName, email, password, phone, gender, address } =
      body;

    if (!firstName || !lastName || !email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Missing required fields" }));
    }

    const genderMap = {
      male: "m",
      female: "f",
      other: "o",
      m: "m",
      f: "f",
      o: "o",
    };

    const normalizedGender = gender
      ? genderMap[String(gender).toLowerCase()]
      : null;
    if (gender && !normalizedGender) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid gender value" }));
    }

    const user = await insertRegisteredUser({
      firstName,
      lastName,
      email,
      password,
      phone,
      gender: normalizedGender,
      address,
      role: "artist_manager",
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        message: "Artist manager created successfully",
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

    console.error("Create user error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

//Login user controller
export async function logIn(req, res) {
  return logInUserController(req, res);
}

export async function logOut(req, res) {
  return logOutUserController(req, res);
}

//Register user controller
export async function registerUser(req, res) {
  return registerUserController(req, res);
}
