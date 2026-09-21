import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsphere';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);

    // In local development, if remote Atlas fails (e.g. IP whitelist not yet enabled), fallback to local MongoDB
    if (process.env.NODE_ENV !== 'production' && uri !== 'mongodb://127.0.0.1:27017/eventsphere') {
      try {
        console.log('[MongoDB]: Attempting fallback to local mongodb://127.0.0.1:27017/eventsphere...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/eventsphere', { serverSelectionTimeoutMS: 5000 });
        console.log(`[MongoDB Connected Local Fallback]: ${localConn.connection.host}/${localConn.connection.name}`);
        return;
      } catch (localErr) {
        console.error(`[Local MongoDB Fallback Failed]: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};
