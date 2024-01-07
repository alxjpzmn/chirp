import db from "@db/init";

const transcriptMigrationQuery = db.query(
  "CREATE TABLE IF NOT EXISTS transcripts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, slug TEXT, url TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, source_type TEXT NOT NULL DEFAULT 'article');",
);

const configMigrationQuery = db.query(
  "CREATE TABLE IF NOT EXISTS config_parameters (id INTEGER PRIMARY KEY, parameter_name TEXT NOT NULL, parameter_value TEXT NOT NULL);",
);

const migrationQueries = [transcriptMigrationQuery, configMigrationQuery];

const runMigrationQueries = () => {
  migrationQueries.forEach((query) => query.run());
  console.info("Migrations applied.");
  return;
};

export default runMigrationQueries;
