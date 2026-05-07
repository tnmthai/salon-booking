const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const initDB = require('./initdb');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/services', require('./routes/services'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/customers', require('./routes/customers'));

// Serve static client build in production
const clientPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientPath));
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Init DB then start server
async function start() {
  try {
    await initDB(pool);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database init error:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Salon booking server running on port ${PORT}`);
  });
}

start();
