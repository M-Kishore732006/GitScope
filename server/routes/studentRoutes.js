const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { updateProfile, getDashboardData, refreshGithubData } = require('../controllers/studentController');

router.put('/profile', protect, authorize('student'), updateProfile);
router.get('/dashboard', protect, authorize('student'), getDashboardData);
router.post('/github/refresh', protect, authorize('student'), refreshGithubData);

module.exports = router;
