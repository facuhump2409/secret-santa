const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'secret-santa.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Participants table
  db.run(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  // Gifts table (wishlist items)
  db.run(`
    CREATE TABLE IF NOT EXISTS gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      gift_description TEXT NOT NULL,
      gift_link TEXT,
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
    )
  `);

  // Clues table
  db.run(`
    CREATE TABLE IF NOT EXISTS clues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      clue_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
    )
  `);

  // Seed with 5 random participant names
  const names = ['Emma Wilson', 'James Anderson', 'Sophia Martinez', 'Oliver Johnson', 'Isabella Brown'];
  
  const stmt = db.prepare('INSERT OR IGNORE INTO participants (name) VALUES (?)');
  names.forEach(name => {
    stmt.run(name);
  });
  stmt.finalize();

  console.log('Database initialized successfully!');
});

module.exports = db;
