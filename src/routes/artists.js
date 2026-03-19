import { pool } from "../db/dbConnect.js";

export async function getArtists(req, res) {
    try {
        const query = `
            SELECT id, name, gender, address, first_release_year, no_of_albums_released, created_at
            FROM artists
            ORDER BY id DESC
        `;

        const result = await pool.query(query);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ artists: result.rows }));
    } catch (error) {
        console.error('Get artists error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
}
