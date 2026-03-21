const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempting to connect to the persistent MongoDB database using the URI in .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(`\n--- DATABASE CONNECTION FAILED ---`);
    console.error(`Make sure you have MongoDB installed and running locally,`);
    console.error(`OR update the MONGO_URI in backend/.env to point to a MongoDB Atlas cluster.\n`);
    process.exit(1); // Stop the server if the database won't connect
  }
};

module.exports = connectDB;
