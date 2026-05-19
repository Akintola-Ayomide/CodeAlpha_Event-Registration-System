import express, { Request, Response } from 'express';
import prisma from '../prisma';

const router = express.Router();

// GET /events - Get all events (including calculated remaining slots)
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { registrations: { where: { status: 'CONFIRMED' } } }
        }
      }
    });

    const formattedEvents = events.map(event => {
      const confirmedCount = event._count.registrations;
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        remainingSlots: Math.max(0, event.capacity - confirmedCount),
        createdAt: event.createdAt
      };
    });

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error while fetching events.' });
  }
});

// GET /events/:id - Get detailed event info by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id as string, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ error: 'Invalid event ID.' });
      return;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: { where: { status: 'CONFIRMED' } } }
        }
      }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    const confirmedCount = event._count.registrations;
    res.json({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      remainingSlots: Math.max(0, event.capacity - confirmedCount),
      createdAt: event.createdAt
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Internal server error while fetching event details.' });
  }
});

export default router;
