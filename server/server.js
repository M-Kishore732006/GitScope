require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./seed/seedAdmin');
const initCronJobs = require('./cron/githubCron');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.io real-time engine
initSocket(server);

// Connect to Database
connectDB().then(async () => {
  // Seed initial Admin user
  await seedAdmin();
  
  // Initialize Cron Jobs
  initCronJobs();

  // Start Server
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
