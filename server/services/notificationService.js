const Notification = require('../models/Notification');

const createNotification = async ({ title, message, type = 'info', category = 'SYSTEM' }) => {
  try {
    await Notification.create({
      title,
      message,
      type,
      category
    });
  } catch (error) {
    console.error('Notification Creation Error:', error.message);
  }
};

module.exports = {
  createNotification
};
