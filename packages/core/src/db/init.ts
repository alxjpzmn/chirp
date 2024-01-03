import { Database } from "bun:sqlite";
import getDataDirPath from "@util/misc/getDataDirPath";

const db = new Database(`${getDataDirPath()}/chirp.db`, { create: true });

export default db;
