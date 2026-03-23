import crypto from "crypto";
import { getRequestBody } from "../utils/bodyParse.js";
import { sessionAuthMiddleware } from "../middleware/sessionAuth.js";
import {
  deleteUserById,
  findUserByEmail,
  getUsers,
  insertUser,
  updateUserById,
} from "../services/user.service.js";
import { hashPassword, verifyPassword } from "../utils/hashPassword.js";
import {
  createUserSession,
  deleteSessionById,
  findUserBySessionId,
} from "../services/sessions.service.js";
import { converter } from "../utils/converter.js";
import { normalizeGender } from "../utils/genderNormalize.js";
import { validateEmail, validateMinLength } from "../utils/validate.js";

export async function registerUserController(req, res) {
  try {
    const body = await getRequestBody(req);

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dob,
      gender,
      address,
      role,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Missing required fields" }));
    }

    const normalizedGender = normalizeGender(gender);
    if (gender && !normalizedGender) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid gender value" }));
    }

    const dobDate = converter(dob, "date");
    if (isNaN(dobDate.getTime())) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ message: "Invalid date format for dob" }),
      );
    }

    if (!validateEmail(email)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid email format" }));
    }

    if (!validateMinLength(password, 6)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          message: "Password must be at least 6 characters long",
        }),
      );
    }

    const normalizedRole = role || "super_admin";

    const { hashedPassword } = hashPassword(password);

    const user = await insertUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      dobDate,
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

export async function createUserController(req, res) {
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
          message: "Only super_admin can create users",
        }),
      );
    }

    const body = await getRequestBody(req);
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      address,
      dob,
      role = "artist_manager",
    } = body;

    if (!firstName || !lastName || !email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Missing required fields" }));
    }

    const normalizedGender = normalizeGender(gender);
    if (gender && !normalizedGender) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid gender value" }));
    }

    const dobDate = converter(dob, "date");
    if (dob && isNaN(dobDate.getTime())) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ message: "Invalid date format for dob" }),
      );
    }

    const { hashedPassword } = hashPassword(password);
    console.log(
      `Hashed password generated for user creation:  ${hashedPassword}`,
    );

    if (!validateEmail(email)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid email format" }));
    }

    if (!validateMinLength(password, 6)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          message: "Password must be at least 6 characters long",
        }),
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Email already exists" }));
    }

    const user = await insertUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      dobDate,
      gender: normalizedGender,
      address,
      role,
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "User created successfully",
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
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function getUsersController(req, res) {
  await sessionAuthMiddleware(req, res);

  if (!req.isAuthenticated || !req.sessionId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }

  const currentUser = await findUserBySessionId(req.sessionId);
  if (!currentUser || currentUser.role !== "super_admin") {
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ message: "Forbidden: Only super_admin can view users" }),
    );
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  if (page < 1 || limit < 1) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ message: "Page and limit must be positive integers" }),
    );
  }

  // console.log(`Fetching users - Page: ${page}, Limit: ${limit}`);

  try {
    const { users, pagination } = await getUsers(page, limit);

    res.writeHead(200, { "Content-Type": "application/json" });

    res.end(JSON.stringify({ users, pagination }));
  } catch (error) {
    console.error("Get users error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function updateUserController(req, res) {
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
        message: "Only super_admin can update user details",
      }),
    );
  }

  const body = await getRequestBody(req);

  const { firstName, lastName, email, phone, gender, address, dob, role } =
    body;

  console.log("Received body for user update:", body);

  let normalizedGender = null;
  if (gender) {
    normalizedGender = normalizeGender(gender);
  }
  let dobDate = null;
  if (dob) {
    dobDate = converter(dob, "date");
    if (isNaN(dobDate.getTime())) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ message: "Invalid date format for dob" }),
      );
    }
  }

  const user = await updateUserById(req.params.id, {
    firstName,
    lastName,
    email,
    phone,
    gender: normalizedGender,
    address,
    dob: dobDate,
    role,
  });

  const { id: userId } = req.params;

  console.log("Update user request for user ID:", userId);

  console.log("Update user request body:", body);
  return res.end(
    JSON.stringify({
      message: "User updated successfully",
      user,
    }),
  );
}

export async function deleteUserController(req, res) {
  const { id: userId } = req.params;

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
        message: "Only super_admin can delete users",
      }),
    );
  }

  const result = await deleteUserById(userId);

  console.log("Delete user request for user ID:", userId);

  return res.end(
    JSON.stringify({
      message: result ? "User deleted successfully" : "Failed to delete user",
      user: result ? { id: userId } : null,
    }),
  );
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

    if (!user || !verifyPassword(password, user.password)) {
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
