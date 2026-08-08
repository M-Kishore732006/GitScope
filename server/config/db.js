const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME,
      family: 4,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
       console.error(`\n[DNS ERROR]: MongoDB Atlas connection refused. Your local network or ISP is likely blocking the DNS query. Try changing your Windows DNS adapter settings to use Google's DNS (8.8.8.8) or Cloudflare's (1.1.1.1)\n`);
    } else {
       console.error(`Error connecting to MongoDB: ${error.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
