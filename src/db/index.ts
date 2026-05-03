import { config } from "dotenv";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env" });
const userDbClient = postgres(process.env.USER_DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
});

export const db = drizzlePostgres(userDbClient);

const postgresClient = postgres(process.env.DATA_DATABASE_URL!, {
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
});

export const dataDb = drizzlePostgres(postgresClient);
