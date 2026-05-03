import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/userdb-schema.ts",
  out: "./migrations-userdb",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.USER_DATABASE_URL!,
  },
});
