const mongoose = require('mongoose');

/**
 * Global variable used to cache the MongoDB connection in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * connectDB()
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Reuses the connection if already established (e.g. on Vercel).
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Set it in your .env file before starting the server.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // serverSelectionTimeoutMS: fail fast (5 s) instead of waiting the
    // default 30 s before surfacing a connection error.
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    }).then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host} / ${mongoose.connection.name}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
