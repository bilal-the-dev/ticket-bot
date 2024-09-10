const path = require("path");
const sqlite3 = require("sqlite3").verbose();

async function getDatabaseConnection() {
  if (db) return db;
  db = new sqlite3.Database(
    path.join(__dirname, "..", "database/database.db"),
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) throw err;
      console.log("Connected to the SQLite database.");
      db.run(`
            CREATE TABLE IF NOT EXISTS faqs (
                id INTEGER PRIMARY KEY,
                question TEXT,
                description TEXT,
                link TEXT
            )
        `);
    }
  );

  return db;
}

module.exports = getDatabaseConnection;
