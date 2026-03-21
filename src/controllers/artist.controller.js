import { pool } from "../db/dbConnect.js";
import { CREATE_ARTIST_QUERY } from "../queries/artist.queries.js";
import { getRequestBody } from "../utils/bodyParse.js";
import { converter } from "../utils/converter.js";

export async function getArtistsController(req, res) {
  try {
    const query = `
      SELECT id, name, gender, address, first_release_year, no_of_albums_released, created_at
      FROM artists
      ORDER BY id DESC
    `;

    const result = await pool.query(query);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ artists: result.rows }));
  } catch (error) {
    console.error("Get artists error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}

export async function createArtistController(req, res) {
  try {
    const body = await getRequestBody(req);
    const { name, dob, gender, address, firstReleaseYear, noOfAlbumsReleased } =
      body;

    console.log("Received artist data:", body);

    if (!name || !dob || !gender || !address) {
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

    const values = [
      name,
      dob,
      String(gender).toLowerCase().charAt(0),
      address,
      firstReleaseYearInt,
      noOfAlbumsReleasedInInt,
    ];

    const result = await pool.query(CREATE_ARTIST_QUERY, values);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Artist created successfully",
        artist: result.rows[0],
      }),
    );
  } catch (error) {
    console.error("Create artist error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
