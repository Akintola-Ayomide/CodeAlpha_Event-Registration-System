import express, { Response } from 'express';
import prisma from '../prisma';
import verifyToken from '../middleware/verifyToken';
import verifyAdmin from '../middleware/verifyAdmin';
import { AuthRequest } from '../types';

const router = express.Router();

// Apply authentication and admin check to all admin routes
router.use(verifyToken);
router.use(verifyAdmin);

// POST /admin/events - Create a new event
router.post('/events', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    // Validation
    if (!title || !date || !location || capacity === undefined) {
      res.status(400).json({ error: 'Title, date, location, and capacity are required.' });
      return;
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity < 0) {
      res.status(400).json({ error: 'Capacity must be a non-negative integer.' });
      return;
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format.' });
      return;
    }

    // Create Event
    const event = await prisma.event.create({
      data: {
        title,
        description: description || '',
        date: eventDate,
        location,
        capacity: parsedCapacity
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error while creating event.' });
  }
});

// PUT /admin/events/:id - Update event details
router.put('/events/:id', async (req: AuthRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ error: 'Invalid event ID.' });
      return;
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    const { title, description, date, location, capacity } = req.body;
    const updateData: {
      title?: string;
      description?: string;
      location?: string;
      date?: Date;
      capacity?: number;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;

    if (date !== undefined) {
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format.' });
        return;
      }
      updateData.date = eventDate;
    }

    if (capacity !== undefined) {
      const parsedCapacity = parseInt(capacity, 10);
      if (isNaN(parsedCapacity) || parsedCapacity < 0) {
        res.status(400).json({ error: 'Capacity must be a non-negative integer.' });
        return;
      }
      updateData.capacity = parsedCapacity;
    }

    // Update Event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData
    });

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error while updating event.' });
  }
});

// DELETE /admin/events/:id - Delete an event (cascade deletes registrations because of DB schema relations)
router.delete('/events/:id', async (req: AuthRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ error: 'Invalid event ID.' });
      return;
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    // Delete Event (which cascade deletes associated registrations in the database)
    await prisma.event.delete({
      where: { id: eventId }
    });

    res.json({
      message: 'Event and all its associated registrations deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error while deleting event.' });
  }
});

// GET /admin/registrations - View all registrations (for reporting)
router.get('/registrations', async (req: AuthRequest, res: Response) => {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        event: true
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching all registrations:', error);
    res.status(500).json({ error: 'Internal server error while fetching registrations reporting.' });
  }
});

export default router;
