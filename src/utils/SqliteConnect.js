const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
let db;

const filePath = path.join(__dirname, "database", "database.db");

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "", "utf8");
  console.log(`${filePath} created successfully.`);
}
async function getDatabaseConnection() {
  if (db) return db;
  db = new sqlite3.Database(
    path.join(filePath),
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
