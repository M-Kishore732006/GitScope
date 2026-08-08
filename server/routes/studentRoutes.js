const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  updateProfile, 
  getDashboardData, 
  refreshGithubData,
  linkGithub,
  linkGithubOauth,
  getAllRepositories,
  getRepositoryById,
  getAchievements,
  getLeaderboards 
} = require('../controllers/studentController');

router.put('/profile', protect, authorize('student'), updateProfile);
router.post('/github/link', protect, authorize('student'), linkGithub);
router.post('/github/oauth', protect, authorize('student'), linkGithubOauth);
router.get('/dashboard', protect, authorize('student'), getDashboardData);
router.post('/github/refresh', protect, authorize('student'), refreshGithubData);
router.get('/repositories', protect, authorize('student'), getAllRepositories);
router.get('/repository/:id', protect, authorize('student'), getRepositoryById);
router.get('/achievements', protect, authorize('student'), getAchievements);
router.get('/leaderboard', protect, authorize('student'), getLeaderboards);

module.exports = router;
