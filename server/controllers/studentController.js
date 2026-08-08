const User = require('../models/User');
const GithubStats = require('../models/GithubStats');
const githubService = require('../services/githubService');
const leaderboardService = require('../services/leaderboardService');

// @desc    Update Student Profile
// @route   PUT /api/student/profile
// @access  Private/Student
const updateProfile = async (req, res) => {
  try {
    const { fullName, department, year, section, githubUsername } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = fullName || user.fullName;
      user.department = department || user.department;
      user.year = year || user.year;
      user.section = section || user.section;
      
      let triggerSync = false;
      if (githubUsername && githubUsername !== user.githubUsername) {
         user.githubUsername = githubUsername;
         user.githubLinked = true;
         triggerSync = true;
      }
      
      user.profileCompleted = true;
      const updatedUser = await user.save();

      // Trigger initial sync async in background if linked
      if (triggerSync) {
         githubService.syncUser(updatedUser._id, updatedUser.githubUsername).then(success => {
             if (success) {
                  leaderboardService.updateLeaderboards();
             }
         });
      }

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        profileCompleted: updatedUser.profileCompleted,
        token: req.headers.authorization.split(' ')[1] 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating profile' });
  }
};

// @desc    Get Student Dashboard Data (Cached from DB)
// @route   GET /api/student/dashboard
// @access  Private/Student
const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let stats = await GithubStats.findOne({ user: req.user._id });

    if (!stats) {
       stats = {
          followers: 0, following: 0, totalRepositories: 0, totalCommits: 0,
          totalPullRequests: 0, mergedPullRequests: 0, totalIssues: 0, totalStars: 0, 
          contributionStreak: 0, contributionScore: 0, level: 'Bronze',
          achievements: [], languageUsage: [], repositoriesList: [], contributionCalendar: [],
          overallRank: 0, departmentRank: 0
       };
    }

    res.json({ user, stats });
  } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

// @desc    Manually Refresh GitHub Data
// @route   POST /api/student/github/refresh
// @access  Private/Student
const refreshGithubData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.githubLinked || !user.githubUsername) {
            return res.status(400).json({ message: 'GitHub account not linked' });
        }

        const success = await githubService.syncUser(user._id, user.githubUsername);
        
        if (success) {
            await leaderboardService.updateLeaderboards();
            return res.status(200).json({ message: 'Successfully refreshed GitHub stats.' });
        } else {
            return res.status(502).json({ message: 'Failed to sync with GitHub API. Please check your token or username.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error refreshing Github Data' });
    }
};

module.exports = {
  updateProfile,
  getDashboardData,
  refreshGithubData
};
