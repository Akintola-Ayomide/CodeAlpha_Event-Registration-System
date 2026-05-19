import express, { Response } from 'express';
import prisma from '../prisma';
import verifyToken from '../middleware/verifyToken';
import { AuthRequest } from '../types';

const router = express.Router();

router.use(verifyToken);

// POST /registrations - Register logged-in user for an event
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      res.status(400).json({ error: 'Event ID is required.' });
      return;
    }

    const parsedEventId = parseInt(eventId, 10);
    if (isNaN(parsedEventId)) {
      res.status(400).json({ error: 'Invalid Event ID.' });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized. User ID not found.' });
      return;
    }

    // 1. Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: parsedEventId }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    // 2. Check if the user has already registered and is CONFIRMED
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        userId: req.userId,
        eventId: parsedEventId
      }
    });

    if (existingRegistration && existingRegistration.status === 'CONFIRMED') {
      res.status(400).json({ error: 'You are already registered for this event.' });
      return;
    }

    // 3. Check event capacity (count CONFIRMED registrations)
    const confirmedCount = await prisma.registration.count({
      where: {
        eventId: parsedEventId,
        status: 'CONFIRMED'
      }
    });

    if (confirmedCount >= event.capacity) {
      res.status(400).json({ error: 'Event is at full capacity. No slots remaining.' });
      return;
    }

    // 4. Create or update registration
    let registration;
    if (existingRegistration && existingRegistration.status === 'CANCELLED') {
      // Re-activate registration if it was cancelled
      registration = await prisma.registration.update({
        where: { id: existingRegistration.id },
        data: { status: 'CONFIRMED' },
        include: { event: true }
      });
    } else {
      // Create new registration record
      registration = await prisma.registration.create({
        data: {
          userId: req.userId,
          eventId: parsedEventId,
          status: 'CONFIRMED'
        },
        include: { event: true }
      });
    }

    res.status(201).json({
      message: 'Successfully registered for the event',
      registration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// GET /registrations/me - List all registrations of the logged-in user
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized. User ID not found.' });
      return;
    }

    const registrations = await prisma.registration.findMany({
      where: { userId: req.userId },
      include: {
        event: true
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Internal server error while fetching registrations.' });
  }
});

// DELETE /registrations/:id - Cancel a registration (update status to CANCELLED)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const registrationId = parseInt(req.params.id, 10);
    if (isNaN(registrationId)) {
      res.status(400).json({ error: 'Invalid registration ID.' });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized. User ID not found.' });
      return;
    }

    // Find the registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId }
    });

    if (!registration) {
      res.status(404).json({ error: 'Registration not found.' });
      return;
    }

    // Ensure the registration belongs to the logged-in user
    if (registration.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied. You can only cancel your own registrations.' });
      return;
    }

    if (registration.status === 'CANCELLED') {
      res.status(400).json({ message: 'Registration is already cancelled.', registration });
      return;
    }

    // Update status to CANCELLED
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' },
      include: { event: true }
    });

    res.json({
      message: 'Registration successfully cancelled',
      registration: updatedRegistration
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ error: 'Internal server error while cancelling registration.' });
  }
});

export default router;
