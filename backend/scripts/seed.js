import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from '../src/services/seedService.js';

dotenv.config();

const run = async () => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsphere';
    const mongoUri = rawUri.trim().replace(/^["']|["']$/g, '');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log(`Connected to database for seeding: ${mongoUri}`);

    await seedDatabase({ force: true });
    console.log('Seeding script completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding script error:', error);
    process.exit(1);
  }
};

run();
