const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  getDashboardOverview,
  getStaffList,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
  resetStaffPassword,
  assignStudentsToStaff,
  getStudentList,
  getStudentDetails,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
  resetStudentPassword,
  getGithubAccounts,
  syncStudentGithub,
  syncAllGithub,
  disconnectStudentGithub,
  getAnalytics,
  getStudentRankings,
  getOpenSourceData,
  getActivityMonitoring,
  generateReport,
  getAuditLogs,
  getSettings,
  updateSettings,
  recalculateAllStudentScores,
  getNotifications,
  globalSearch
} = require('../controllers/adminController');

// All Admin routes require authentication and ADMIN role authorization
router.use(protect, authorize('admin'));

// 1. Dashboard Overview
router.get('/dashboard', getDashboardOverview);

// 2. Staff Management
router.get('/staff', getStaffList);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.put('/staff/:id/status', toggleStaffStatus);
router.delete('/staff/:id', deleteStaff);
router.put('/staff/:id/reset-password', resetStaffPassword);
router.post('/staff/:id/assign-students', assignStudentsToStaff);

// 3. Student Management
router.get('/students', getStudentList);
router.get('/students/:id', getStudentDetails);
router.put('/students/:id', updateStudent);
router.put('/students/:id/status', toggleStudentStatus);
router.delete('/students/:id', deleteStudent);
router.put('/students/:id/reset-password', resetStudentPassword);

// 4. GitHub Accounts
router.get('/github/accounts', getGithubAccounts);
router.post('/github/sync/:studentId', syncStudentGithub);
router.post('/github/sync-all', syncAllGithub);
router.post('/github/disconnect/:studentId', disconnectStudentGithub);

// 5. Analytics
router.get('/analytics', getAnalytics);

// 6. Rankings
router.get('/rankings', getStudentRankings);

// 7. Open Source
router.get('/open-source', getOpenSourceData);

// 8. Activity Monitoring
router.get('/monitoring', getActivityMonitoring);

// 9. Reports
router.get('/reports/generate', generateReport);

// 10. Audit Logs
router.get('/audit-logs', getAuditLogs);

// 11. Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/recalculate-scores', recalculateAllStudentScores);

// 12. Global Search & Notifications
router.get('/notifications', getNotifications);
router.get('/search', globalSearch);

module.exports = router;
