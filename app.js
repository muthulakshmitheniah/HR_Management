const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const db = new sqlite3.Database('./data/database.db');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create the faculty table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS faculty (
    faculty_number TEXT PRIMARY KEY,
    faculty_name TEXT,
    faculty_profile TEXT,
    joining_year TEXT,
    birth_date TEXT,
    department TEXT,
    mobile TEXT,
    faculty_email TEXT
  )
`);

// Create the students table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT,
    profile TEXT,
    birth_date TEXT,
    mobile TEXT,
    email TEXT,
    department TEXT,
    cgpa REAL
  )
`);

// Get all faculties
app.get('/api/faculties', (req, res) => {
  db.all('SELECT * FROM faculty', [], (err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching data' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Get a single faculty by faculty_number
app.get('/api/faculties/:facultyNumber', (req, res) => {
  const facultyNumber = req.params.facultyNumber;
  db.get('SELECT * FROM faculty WHERE faculty_number = ?', [facultyNumber], (err, row) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching data' });
    } else if (!row) {
      res.status(404).send({ message: 'Faculty not found' });
    } else {
      res.status(200).json(row);
    }
  });
});

// Add a new faculty
app.post('/api/faculties', upload.single('faculty_profile'), (req, res) => {
  const {
    faculty_number,
    faculty_name,
    joining_year,
    birth_date,
    department,
    mobile,
    faculty_email
  } = req.body;

  const faculty_profile = req.file ? req.file.filename : null;

  const insertQuery = `
    INSERT INTO faculty (faculty_number, faculty_name, faculty_profile, joining_year, birth_date, department, mobile, faculty_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(insertQuery, [faculty_number, faculty_name, faculty_profile, joining_year, birth_date, department, mobile, faculty_email], function (err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).send({ error: 'Error inserting data' });
    } else {
      res.status(201).send({ message: 'Faculty added successfully' });
    }
  });
});

// Update an existing faculty
app.put('/api/faculties/:facultyNumber', upload.single('faculty_profile'), (req, res) => {
  const facultyNumber = req.params.facultyNumber;
  const {
    faculty_name,
    joining_year,
    birth_date,
    department,
    mobile,
    faculty_email
  } = req.body;

  const faculty_profile = req.file ? req.file.filename : req.body.faculty_profile;

  const updateQuery = `
    UPDATE faculty
    SET faculty_name = ?, faculty_profile = ?, joining_year = ?, birth_date = ?, department = ?, mobile = ?, faculty_email = ?
    WHERE faculty_number = ?
  `;

  db.run(updateQuery, [faculty_name, faculty_profile, joining_year, birth_date, department, mobile, faculty_email, facultyNumber], function (err) {
    if (err) {
      console.error('Error updating data:', err.message);
      res.status(500).send({ error: 'Error updating data' });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'Faculty not found' });
    } else {
      res.status(200).send({ message: 'Faculty updated successfully' });
    }
  });
});

// Delete a faculty
app.delete('/api/faculties/:facultyNumber', (req, res) => {
  const facultyNumber = req.params.facultyNumber;

  const deleteQuery = 'DELETE FROM faculty WHERE faculty_number = ?';

  db.run(deleteQuery, [facultyNumber], function (err) {
    if (err) {
      console.error('Error deleting data:', err.message);
      res.status(500).send({ error: 'Error deleting data' });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'Faculty not found' });
    } else {
      res.status(200).send({ message: 'Faculty deleted successfully' });
    }
  });
});

// CRUD routes for students

// Get all students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching data' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Get a single student by id
app.get('/api/students/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching data' });
    } else if (!row) {
      res.status(404).send({ message: 'Student not found' });
    } else {
      res.status(200).json(row);
    }
  });
});

// Add a new student
app.post('/api/students', upload.single('profile'), (req, res) => {
  const {
    id,
    name,
    birth_date,
    mobile,
    email,
    department,
    cgpa
  } = req.body;

  const profile = req.file ? req.file.filename : null;

  const insertQuery = `
    INSERT INTO students (id, name, profile, birth_date, mobile, email, department, cgpa)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(insertQuery, [id, name, profile, birth_date, mobile, email, department, cgpa], function (err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).send({ error: 'Error inserting data' });
    } else {
      res.status(201).send({ message: 'Student added successfully' });
    }
  });
});

// Update an existing student
app.put('/api/students/:id', upload.single('profile'), (req, res) => {
  const id = req.params.id;
  const {
    name,
    birth_date,
    mobile,
    email,
    department,
    cgpa
  } = req.body;

  const profile = req.file ? req.file.filename : req.body.profile;

  const updateQuery = `
    UPDATE students
    SET name = ?, profile = ?, birth_date = ?, mobile = ?, email = ?, department = ?, cgpa = ?
    WHERE id = ?
  `;

  db.run(updateQuery, [name, profile, birth_date, mobile, email, department, cgpa, id], function (err) {
    if (err) {
      console.error('Error updating data:', err.message);
      res.status(500).send({ error: 'Error updating data' });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'Student not found' });
    } else {
      res.status(200).send({ message: 'Student updated successfully' });
    }
  });
});

// Delete a student
app.delete('/api/students/:id', (req, res) => {
  const id = req.params.id;

  const deleteQuery = 'DELETE FROM students WHERE id = ?';

  db.run(deleteQuery, [id], function (err) {
    if (err) {
      console.error('Error deleting data:', err.message);
      res.status(500).send({ error: 'Error deleting data' });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'Student not found' });
    } else {
      res.status(200).send({ message: 'Student deleted successfully' });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
