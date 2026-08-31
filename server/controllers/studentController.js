const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const GithubStats = require('../models/GithubStats');
const githubService = require('../services/githubService');
const leaderboardService = require('../services/leaderboardService');
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

// @desc    Change User Password
// @route   PUT /api/student/password
// @access  Private/Student
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully. Please log back in.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error updating password' });
    }
};

// @desc    Delete Student Account
// @route   POST /api/student/account/delete
// @access  Private/Student
const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required to confirm account deletion.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Incorrect password. Deletion aborted for security.' });
        }

        // Cascade delete Github Stats
        await GithubStats.deleteOne({ user: user._id });
        
        // Delete User
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'Account permanently deleted.' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error deleting account' });
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

    res.json({ user, stats, clientId: process.env.GITHUB_CLIENT_ID });
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
// @desc    Link GitHub Account
// @route   POST /api/student/github/link
// @access  Private/Student
const linkGithub = async (req, res) => {
    try {
        const { githubUsername } = req.body;
        if (!githubUsername) return res.status(400).json({ message: 'GitHub username is required' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.githubUsername = githubUsername;
        user.githubLinked = true;
        await user.save();

        const success = await githubService.syncUser(user._id, user.githubUsername);
        if (success) {
            await leaderboardService.updateLeaderboards();
            return res.status(200).json({ message: 'GitHub linked successfully' });
        } else {
            return res.status(502).json({ message: 'Failed to fetch GitHub data. It may be invalid.' });
        }
    } catch (error) {
        console.error('linkGithub ERROR:', error);
        res.status(500).json({ message: 'Error linking GitHub: ' + (error.message || '') });
    }
}

// @desc    Link GitHub via OAuth Code
// @route   POST /api/student/github/oauth
// @access  Private/Student
const linkGithubOauth = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'GitHub OAuth code is required' });

        // 1. Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
            redirect_uri: req.body.redirectUri || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/student/github/callback'
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            console.error("OAuth Exchange Error:", tokenResponse.data);
            return res.status(400).json({ message: 'Failed to exchange OAuth code for access token.' });
        }

        // 2. Fetch authenticated user data from GitHub
        const githubUserRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const githubUsername = githubUserRes.data.login;
        if (!githubUsername) {
            return res.status(400).json({ message: 'Could not fetch GitHub user profile' });
        }

        // 3. Link logic identical to earlier
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.githubUsername = githubUsername;
        user.githubLinked = true;
        await user.save();

        const success = await githubService.syncUser(user._id, user.githubUsername);
        if (success) {
            await leaderboardService.updateLeaderboards();
            return res.status(200).json({ message: 'GitHub connected successfully', username: githubUsername });
        } else {
            return res.status(502).json({ message: 'Failed to fetch GitHub statistics after linking.' });
        }

    } catch (error) {
        console.error('linkGithubOauth ERROR:', error);
        res.status(500).json({ message: 'Error during GitHub OAuth linking: ' + (error.message || '') });
    }
}

// @desc    Unlink GitHub Account
// @route   POST /api/student/github/unlink
// @access  Private/Student
const unlinkGithub = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.githubLinked) {
            return res.status(400).json({ message: 'No GitHub account is linked.' });
        }

        // Clear GitHub fields
        user.githubUsername = '';
        user.githubLinked = false;
        await user.save();

        // Remove stale GitHub stats so dashboard starts fresh
        await GithubStats.deleteOne({ user: user._id });
        await leaderboardService.updateLeaderboards();

        return res.status(200).json({ message: 'GitHub account unlinked successfully.' });
    } catch (error) {
        console.error('unlinkGithub ERROR:', error);
        res.status(500).json({ message: 'Error unlinking GitHub: ' + (error.message || '') });
    }
};

// @desc    Get All Repositories
// @route   GET /api/student/repositories
// @access  Private/Student
const getAllRepositories = async (req, res) => {
    try {
        const stats = await GithubStats.findOne({ user: req.user._id });
        res.json(stats ? stats.repositoriesList : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching repositories' });
    }
}

// @desc    Get Repository By ID (Name)
// @route   GET /api/student/repository/:id
// @access  Private/Student
const getRepositoryById = async (req, res) => {
    try {
        const stats = await GithubStats.findOne({ user: req.user._id });
        if (!stats) return res.status(404).json({ message: 'No stats found' });
        const repo = stats.repositoriesList.find(r => r.name === req.params.id);
        if (repo) res.json(repo);
        else res.status(404).json({ message: 'Repository not found' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching repository details' });
    }
}

// @desc    Get Achievements
// @route   GET /api/student/achievements
// @access  Private/Student
const getAchievements = async (req, res) => {
    try {
        const stats = await GithubStats.findOne({ user: req.user._id });
        res.json({ achievements: stats ? stats.achievements : [], level: stats ? stats.level : 'Bronze' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching achievements' });
    }
}

// @desc    Get Leaderboard
// @route   GET /api/student/leaderboard
// @access  Private/Student
const getLeaderboards = async (req, res) => {
    try {
        const stats = await GithubStats.find().sort({ contributionScore: -1 }).populate('user', 'username fullName department year role');
        // Filter out those without user or not student
        const validStats = stats.filter(s => s.user && s.user.role === 'student');

        const overall = validStats.map(s => ({
            rank: s.overallRank,
            name: s.user.fullName || s.user.username,
            department: s.user.department,
            year: s.user.year,
            score: s.contributionScore,
            commits: s.totalCommits,
            pullRequests: s.mergedPullRequests,
            level: s.level
        }));

        res.json(overall); // The frontend can handle department and year-wise grouping if it wants, or we can send grouped object
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

module.exports = {
  updateProfile,
  changePassword,
  deleteAccount,
  getDashboardData,
  refreshGithubData,
  linkGithub,
  linkGithubOauth,
  unlinkGithub,
  getAllRepositories,
  getRepositoryById,
  getAchievements,
  getLeaderboards
};
