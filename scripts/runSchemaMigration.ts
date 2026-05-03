import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { migrateToIntegersAndTimestampsForTurso } from "../src/db/migration";

// Load env from .env.local first (if present), then fallback to .env for any missing keys
config({ path: ".env.local", override: true });
config({ path: ".env" });

async function main() {
  try {
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error("Missing TURSO_CONNECTION_URL. Ensure it is set in .env.local or .env.");
    }

    if (!authToken) {
      throw new Error("Missing TURSO_AUTH_TOKEN. Ensure it is set in .env.local or .env.");
    }

    const client = createClient({ url, authToken });
    const db = drizzle(client);

    console.log("Starting schema migration (IDs -> integers, dates -> ms timestamps)...");
    await migrateToIntegersAndTimestampsForTurso(db as any);
    console.log("Schema migration completed.");
  } catch (err) {
    console.error("Schema migration failed:", err);
    process.exit(1);
  }
}

main();
