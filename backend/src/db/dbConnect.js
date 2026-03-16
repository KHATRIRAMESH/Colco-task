import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
export const pool = new Pool({
    host: 'localhost',
    port: 5433,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
