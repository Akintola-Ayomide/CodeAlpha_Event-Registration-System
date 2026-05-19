const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Generating password hashes...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const userPasswordHash = await bcrypt.hash('user123', salt);

  console.log('Creating seed users...');
  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  // Create normal user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      passwordHash: userPasswordHash,
      role: 'USER'
    }
  });

  console.log('Creating seed events...');
  // Create events
  const event1 = await prisma.event.create({
    data: {
      title: 'Tech Conference 2026',
      description: 'The premier conference for developers and designers exploring advanced AI and web technologies.',
      date: new Date('2026-09-15T09:00:00Z'),
      location: 'San Francisco, CA',
      capacity: 100
    }
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'AI Workshop',
      description: 'Hands-on training session for building LLM agents and workflows.',
      date: new Date('2026-10-20T10:00:00Z'),
      location: 'New York, NY',
      capacity: 2
    }
  });

  console.log('Database seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log(`Admin User:  ${admin.email}  |  Password: admin123`);
  console.log(`Normal User: ${user.email}   |  Password: user123`);
  console.log(`Events:      "${event1.title}" (Cap: 100), "${event2.title}" (Cap: 2)`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
