const AuditLog = require('../models/AuditLog');

const logAuditAction = async ({ req, user, action, target, description }) => {
  try {
    const actor = user || req?.user;
    if (!actor) return;

    let ipAddress = '127.0.0.1';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    }

    await AuditLog.create({
      user: actor._id,
      userEmail: actor.email || 'system@gitscope.com',
      userRole: actor.role || 'system',
      action,
      target: target || 'N/A',
      description: description || '',
      ipAddress
    });
  } catch (error) {
    console.error('Audit Logging Error:', error.message);
  }
};

module.exports = {
  logAuditAction
};
