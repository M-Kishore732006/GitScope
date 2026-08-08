require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./seed/seedAdmin');
const initCronJobs = require('./cron/githubCron');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(async () => {
  // Seed initial Admin user
  await seedAdmin();
  
  // Initialize Cron Jobs
  initCronJobs();

  // Start Server
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
