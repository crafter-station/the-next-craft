import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const createDatabase = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return drizzle(neon(databaseUrl), { schema });
};

type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

// Next evaluates route modules while building, before runtime secrets exist.
export const db = new Proxy({} as Database, {
  get(_target, property) {
    database ??= createDatabase();
    const value = Reflect.get(database, property, database);
    return typeof value === "function" ? value.bind(database) : value;
  },
});
