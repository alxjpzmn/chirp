import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import getBasePath from "@util/misc/getBasePath";

const sqlite = new Database(`${getBasePath()}/chirp.db`);
export const db = drizzle(sqlite, { schema });
