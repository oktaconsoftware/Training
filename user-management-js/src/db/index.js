import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
}
const globalForDb = globalThis;
const pool = globalForDb.postgresPool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
        ssl: process.env.DATABASE_SSL === "true"
            ? { rejectUnauthorized: true }
            : false,
    });
if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresPool = pool;
}
export const db = drizzle(pool, { schema });
export { pool };
