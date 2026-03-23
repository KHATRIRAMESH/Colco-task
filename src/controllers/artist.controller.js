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
import { validateMinLength, validateEmail } from "../utils/validate.js";

export async function getArtistsController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated || !req.sessionId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }
  const currentUser = await findUserBySessionId(req.sessionId);
  if (
    !currentUser ||
    (currentUser.role !== "super_admin" &&
      currentUser.role !== "artist_manager")
  ) {
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Forbidden" }));
  }

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
  if (!req.isAuthenticated || !req.sessionId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }
  const currentUser = await findUserBySessionId(req.sessionId);
  if (!currentUser || currentUser.role !== "artist_manager") {
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Forbidden" }));
  }
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

export async function exportArtistsController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Unauthorized" }));
  }
  const currentUser = await findUserBySessionId(req.sessionId);
  if (!currentUser || currentUser.role !== "artist_manager") {
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Forbidden" }));
  }

  try {
    const { getAllArtists } = await import("../services/artist.service.js");
    const artists = await getAllArtists();
    if (artists.length === 0) {
      res.writeHead(200, { "Content-Type": "text/csv" });
      return res.end(
        "id,name,dob,gender,address,first_release_year,no_of_albums_released\n",
      );
    }
    const header = Object.keys(artists[0]).join(",");
    const rows = artists.map((a) =>
      Object.values(a)
        .map((v) => `"${String(v !== null ? v : "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=artists.csv",
    });
    return res.end(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function importArtistsController(req, res) {
  await sessionAuthMiddleware(req, res);
  if (!req.isAuthenticated) {
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
    const rows = body.csvRows;

    if (!rows || rows.length === 0) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Empty or invalid CSV" }));
    }

    const errors = [];
    let imported = 0;

    for (const [index, row] of rows.entries()) {
      const rowNum = index + 2; // +2 to account for header and 0-based index
      try {
        let passwordValue = row.password;
        if (!validateMinLength(passwordValue, 6)) {
          throw new Error("Password must be at least 6 characters long");
        }
        const { hashedPassword } = hashPassword(passwordValue);

        let emailValue = row.email || `artist${Date.now()}${index}@example.com`;
        if (!validateEmail(emailValue)) {
          throw new Error("Invalid email format");
        }

        let dobDate = null;
        if (row.dob) {
          dobDate = converter(row.dob, "date");
          if (isNaN(dobDate.getTime())) dobDate = null;
        }

        const normalizedGender = normalizeGender(row.gender || "m");

        const userValues = {
          firstName: row.firstName || row.first_name || row.name || "Unknown",
          lastName: row.lastName || row.last_name || "Artist",
          email: emailValue,
          password: hashedPassword,
          phone: row.phone || null,
          dobDate: dobDate,
          gender: normalizedGender || "m",
          address: row.address || null,
          role: "artist",
        };

        const userResult = await insertUser(userValues);

        const firstReleaseYear = row.firstReleaseYear || row.first_release_year;
        const noOfAlbumsReleased =
          row.noOfAlbumsReleased || row.no_of_albums_released;

        const artistValues = [
          userResult.id,
          `${userValues.firstName} ${userValues.lastName}`.trim(),
          dobDate,
          userValues.gender,
          userValues.address,
          firstReleaseYear ? parseInt(firstReleaseYear) : null,
          noOfAlbumsReleased ? parseInt(noOfAlbumsReleased) : null,
        ];

        await createArtist(artistValues);
        imported++;
      } catch (err) {
        console.error(`Error importing row ${rowNum}:`, err.message);
        errors.push(`Row ${rowNum}: ${err.message}`);
      }
    }

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        message: `Successfully imported ${imported} artists.`,
        errors: errors.length > 0 ? errors : undefined,
      }),
    );
  } catch (error) {
    console.error("Import error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
