const mongoose = require('mongoose');

/**
 * connectDB()
 * Connects to MongoDB using the MONGODB_URI environment variable.
 *
 * Behaviour:
 *  - Returns the Mongoose connection on success.
 *  - THROWS an error on failure (missing URI or network error).
 *  - The caller (server.js) is responsible for not starting
 *    the Express server if this function throws.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Set it in your .env file before starting the server.'
    );
  }

  // serverSelectionTimeoutMS: fail fast (5 s) instead of waiting the
  // default 30 s before surfacing a connection error.
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;
