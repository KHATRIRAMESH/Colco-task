import { pool } from "../db/dbConnect.js";
import { sessionAuthMiddleware } from "../middleware/sessionAuth.js";
import {
  createArtist,
  deleteArtist,
  getArtists,
  updateArtistById,
} from "../services/artist.service.js";
import { findUserBySessionId } from "../services/sessions.service.js";
import { deleteUserById, insertUser } from "../services/user.service.js";
import { getRequestBody } from "../utils/bodyParse.js";
import { converter } from "../utils/converter.js";
import { normalizeGender } from "../utils/genderNormalize.js";
import { hashPassword } from "../utils/hashPassword.js";

export async function getArtistsController(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Invalid page or limit value" }));
  }

  try {
    const { artists, pagination } = await getArtists(page, limit);
    console.log("Fetched artists:", artists);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ artists, pagination }));
  } catch (error) {
    console.error("Get artists error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function createArtistController(req, res) {
  await sessionAuthMiddleware(req, res);

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
      firstReleaseYear,
      noOfAlbumsReleased,
    } = body;

    console.log("Received artist data:", body);

    if (!firstName || !dob || !gender || !address) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Missing required fields" }));
    }

    let noOfAlbumsReleasedInInt = null;
    // No. of albums released is optional, but if provided, it must be a number
    if (noOfAlbumsReleased !== undefined && noOfAlbumsReleased !== "") {
      noOfAlbumsReleasedInInt = converter(noOfAlbumsReleased, "number");
      if (isNaN(noOfAlbumsReleasedInInt)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "noOfAlbumsReleased must be a number" }),
        );
      }
    }

    const firstReleaseYearInt =
      firstReleaseYear !== undefined && firstReleaseYear !== ""
        ? converter(firstReleaseYear, "number")
        : null;

    if (firstReleaseYearInt !== null && isNaN(firstReleaseYearInt)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ message: "firstReleaseYear must be a number" }),
      );
    }

    const dobDate = converter(dob, "date");
    if (isNaN(dobDate.getTime())) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ message: "Invalid date format for dob" }),
      );
    }

    const { hashedPassword } = hashPassword(password);

    const normalizedRole = "artist";
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

    const userValues = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      dobDate,
      gender: normalizedGender,
      address,
      role: normalizedRole,
    };

    const userResult = await insertUser(userValues);
    console.log("User created with ID:", userResult.id);

    const artistValues = [
      userResult.id,
      `${firstName} ${lastName}`,
      dobDate,
      normalizedGender,
      address,
      firstReleaseYearInt,
      noOfAlbumsReleasedInInt,
    ];
    const result = await createArtist(artistValues);
    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        message: "Artist created successfully",
        artist: result,
      }),
    );
  } catch (error) {
    console.error("Create artist error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function deleteArtistController(req, res) {
  await sessionAuthMiddleware(req, res);
  const artistId = req.params.id;

  const artistResult = await pool.query(
    "SELECT user_id FROM artists WHERE id = $1",
    [artistId],
  );
  if (artistResult.rows.length === 0) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Artist not found" }));
  }
  const userId = artistResult.rows[0].user_id;

  console.log("Received request to delete artist with ID:", userId);

  await deleteArtist(artistId);
  await deleteUserById(userId);

  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify({ message: "Artist deleted successfully" }));
  // console.log("Artist fetched for deletion:", userResult.rows[0]);
}

export async function updateArtistController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated || !req.sessionId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }

  const currentUser = await findUserBySessionId(req.sessionId);
  if (!currentUser || currentUser.role !== "artist_manager") {
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Forbidden" }));
  }

  try {
    const body = await getRequestBody(req);
    const { name, dob, gender, address, firstReleaseYear, noOfAlbumsReleased } =
      body;
    let normalizedGenderValue = null;
    if (gender) {
      normalizedGenderValue = normalizeGender(gender);
    }
    let dobDate = null;
    if (dob) {
      dobDate = converter(dob, "date");
    }
    let firstReleaseYearInt = null;
    if (firstReleaseYear !== undefined && firstReleaseYear !== "") {
      firstReleaseYearInt = converter(firstReleaseYear, "number");
    }
    let noOfAlbumsReleasedInt = null;
    if (noOfAlbumsReleased !== undefined && noOfAlbumsReleased !== "") {
      noOfAlbumsReleasedInt = converter(noOfAlbumsReleased, "number");
    }

    console.log("Prepared artist update values:", {
      name,
      dobDate,
      normalizedGenderValue,
      address,
      firstReleaseYearInt,
      noOfAlbumsReleasedInt,
    });

    const artist = await updateArtistById(req.params.id, {
      name,
      dob: dobDate,
      gender: normalizedGenderValue,
      address,
      firstReleaseYear: firstReleaseYearInt,
      noOfAlbumsReleased: noOfAlbumsReleasedInt,
    });

    // console.log("Artist updated:", artist);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        message: "Artist updated successfully",
        artist,
      }),
    );
  } catch (error) {
    console.error("Update artist error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
