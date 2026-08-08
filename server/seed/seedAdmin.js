const User = require('../models/User');

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
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
