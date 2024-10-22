const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS faculty (
        faculty_number TEXT PRIMARY KEY,
        faculty_name TEXT NOT NULL,
        faculty_profile BLOB,
        joining_year INTEGER NOT NULL,
        birth_date TEXT NOT NULL,
        department TEXT NOT NULL,
        mobile TEXT NOT NULL,
        faculty_email TEXT NOT NULL
      )
    `;

    db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table "faculty" created or already exists.');
      }
    });
  }
});

module.exports = db;
