import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import getBasePath from "@util/misc/getBasePath";

const sqlite = new Database(`${getBasePath()}/chirp.db`);
const db = drizzle(sqlite);
console.log("running migration in folder: ", `${getBasePath()}/drizzle`);

migrate(db, {
  migrationsFolder: `${getBasePath()}/drizzle`,
});
