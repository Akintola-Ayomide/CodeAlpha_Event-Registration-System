import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import registrationRoutes from './routes/registrations';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/registrations', registrationRoutes);
app.use('/admin', adminRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Event Registration System API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
