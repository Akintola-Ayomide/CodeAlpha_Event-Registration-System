require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Event Registration System API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
