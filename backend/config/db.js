const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log('Connecting to specified MongoDB URI...');
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    }

    // Fallback: If no URI provided, use MongoMemoryServer for instant local evaluation without setup
    console.log('No MONGODB_URI provided. Initializing embedded MongoDB server for instant zero-config testing...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`Embedded MongoDB Server active and connected at: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Direct MongoDB connection failed (${error.message}). Attempting embedded fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Fallback Embedded MongoDB Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`MongoDB connection error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
