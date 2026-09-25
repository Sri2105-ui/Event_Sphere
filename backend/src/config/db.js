import mongoose from 'mongoose';
import { autoSeedIfEmpty } from '../services/seedService.js';

let isConnected = false;

// Setup Mongoose connection lifecycle listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[MongoDB]: Connected to database successfully (readyState: 1).');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB Connection Error]:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB]: Disconnected from database.');
});

export const connectDB = async () => {
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsphere';
  const uri = rawUri.trim().replace(/^["']|["']$/g, '');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed default events & categories if database is empty
    autoSeedIfEmpty().catch((err) => console.warn('[Auto-Seed Warning]:', err.message));
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);

    // In local development, if remote Atlas fails, fallback to local MongoDB
    if (process.env.NODE_ENV !== 'production' && !uri.includes('127.0.0.1:27017')) {
      try {
        console.log('[MongoDB]: Attempting fallback to local mongodb://127.0.0.1:27017/eventsphere...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/eventsphere', {
          serverSelectionTimeoutMS: 5000
        });
        isConnected = true;
        console.log(`[MongoDB Connected Local Fallback]: ${localConn.connection.host}/${localConn.connection.name}`);
        autoSeedIfEmpty().catch((err) => console.warn('[Auto-Seed Warning]:', err.message));
        return localConn;
      } catch (localErr) {
        console.error(`[Local MongoDB Fallback Failed]: ${localErr.message}`);
      }
    }

    // In production or cloud environment, do NOT exit process!
    // Auto-retry in background every 5 seconds so server stays up and healthy
    console.warn('[MongoDB]: Database is not connected yet. Retrying in 5 seconds in background...');
    setTimeout(connectDB, 5000);
  }
};

// ReadyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
export const isDBConnected = () => mongoose.connection.readyState === 1;

