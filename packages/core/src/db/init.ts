import { Database } from "bun:sqlite";
import getBasePath from "@util/misc/getBasePath";

const db = new Database(`${getBasePath()}/chirp.db`, { create: true });

export default db;
