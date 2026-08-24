import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` runs during image builds where no .env exists, so the URL
// is read permissively here. Commands that genuinely need a connection
// (migrate, db push, studio) fail with a clear error when it is absent.
const databaseUrl = process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
