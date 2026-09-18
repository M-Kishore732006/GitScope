const User = require('../models/User');
const { toTitleCase } = require('../utils/formatters');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const admin = new User({
        username: 'Admin',
        rollNumber: 'ADMIN-01',
        email: adminEmail,
        phoneNumber: '0000000000',
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        profileCompleted: true,
        fullName: 'System Administrator'
      });
      
      await admin.save();
      console.log('Admin account seeded successfully');
    } else {
      adminExists.password = process.env.ADMIN_PASSWORD;
      adminExists.fullName = toTitleCase(adminExists.fullName || 'System Administrator');
      await adminExists.save();
      console.log('Admin account already exists. Credentials updated to match .env');
    }

    // Ensure all existing users in the database have Title Case names
    const existingUsers = await User.find({});
    for (const u of existingUsers) {
      let changed = false;
      const tcUsername = toTitleCase(u.username);
      const tcFullName = toTitleCase(u.fullName || u.username);
      if (u.username !== tcUsername) {
        u.username = tcUsername;
        changed = true;
      }
      if (u.fullName !== tcFullName) {
        u.fullName = tcFullName;
        changed = true;
      }
      if (changed) {
        await u.save();
      }
    }
  } catch (error) {
    console.error('Error seeding admin or normalizing names:', error);
  }
};

module.exports = seedAdmin;
