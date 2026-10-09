const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  getStaffDashboard,
  getAssignedStudentsList,
  getStudentProfileDetails,
  getStudentActivityTimeline,
  getStudentRepositories,
  getStudentOpenSource,
  getActivityMonitoring,
  compareStudents,
  getAssignedRankings,
  getStaffAnalytics,
  generateStaffReport,
  getStaffNotifications,
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
  syncStudentGithub,
  getAtRiskAnalytics,
  sendEarlyWarningNotice
} = require('../controllers/staffController');

// All staff routes require authentication and staff/teacher role
router.use(protect);
router.use(authorize('teacher', 'staff'));

// 1. Dashboard Overview
router.get('/dashboard', getStaffDashboard);

// 2. My Students List
router.get('/students', getAssignedStudentsList);
router.get('/my-students', getAssignedStudentsList); // Compatibility alias

// 3. Student Detailed Telemetry & Sections
router.get('/students/:id', getStudentProfileDetails);
router.get('/students/:id/activity', getStudentActivityTimeline);
router.get('/students/:id/repositories', getStudentRepositories);
router.get('/students/:id/open-source', getStudentOpenSource);
router.post('/students/:id/sync', syncStudentGithub);

// 4. Monitoring, At-Risk & Comparison
router.get('/monitoring', getActivityMonitoring);
router.get('/at-risk', getAtRiskAnalytics);
router.post('/at-risk/warning', sendEarlyWarningNotice);
router.post('/notifications/send', sendEarlyWarningNotice); // Compatibility alias
router.post('/send', sendEarlyWarningNotice); // When mounted at /api/notifications
router.get('/compare', compareStudents);

// 5. Rankings & Analytics
router.get('/rankings', getAssignedRankings);
router.get('/analytics', getStaffAnalytics);

// 6. Reports & Notifications
router.get('/reports/generate', generateStaffReport);
router.get('/notifications', getStaffNotifications);

// 7. Profile & Password
router.get('/profile', getStaffProfile);
router.put('/profile', updateStaffProfile);
router.put('/change-password', changeStaffPassword);

module.exports = router;
