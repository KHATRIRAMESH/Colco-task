import { pool } from "./db/dbConnect.js";

async function startServer() {
    try {
        await pool.connect();
        console.log("Server is running...");
        // You can add your server code here (e.g., Express app)
    } catch (error) {
        console.error("Error starting server:", error);
    }
}

startServer();

