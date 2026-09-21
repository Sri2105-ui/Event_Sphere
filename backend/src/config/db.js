import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsphere';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);

    // In local development, if remote Atlas fails, fallback to local MongoDB
    if (process.env.NODE_ENV !== 'production' && uri !== 'mongodb://127.0.0.1:27017/eventsphere') {
      try {
        console.log('[MongoDB]: Attempting fallback to local mongodb://127.0.0.1:27017/eventsphere...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/eventsphere', { serverSelectionTimeoutMS: 5000 });
        isConnected = true;
        console.log(`[MongoDB Connected Local Fallback]: ${localConn.connection.host}/${localConn.connection.name}`);
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

export const isDBConnected = () => isConnected || mongoose.connection.readyState === 1;
