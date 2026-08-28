const mongoose = require('mongoose');

const githubStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  githubUsername: {
    type: String,
    required: true
  },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  totalRepositories: { type: Number, default: 0 },
  totalCommits: { type: Number, default: 0 },
  totalPullRequests: { type: Number, default: 0 },
  mergedPullRequests: { type: Number, default: 0 },
  totalIssues: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  totalForks: { type: Number, default: 0 },
  totalOrganizations: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  contributionStreak: { type: Number, default: 0 },
  
  contributionScore: { type: Number, default: 0 },
  overallRank: { type: Number, default: 0 },
  departmentRank: { type: Number, default: 0 },
  
  level: {
    type: String, // Bronze, Silver, Gold, Platinum, Diamond, Legend
    default: 'Bronze'
  },
  
  achievements: [{
    name: String,
    earnedAt: Date, // If null, it means locked/not earned
    description: String
  }],
  
  languageUsage: [{
    language: String,
    count: Number // size/bytes or count to make the Pie Chart
  }],

  repositoriesList: [{
    name: String,
    url: String,
    description: String,
    stars: Number,
    forks: Number,
    primaryLanguage: String,
    createdAt: Date,
    languages: [{
      language: String,
      count: Number
    }]
  }],

  contributionCalendar: [{
    date: Date,
    count: Number
  }],

  recentActivity: [{
    type: { type: String },
    repoName: { type: String },
    action: { type: String },
    createdAt: { type: Date }
  }],

  syncStatus: {
    type: String,
    enum: ['Connected', 'Not Connected', 'Syncing', 'Sync Failed'],
    default: 'Not Connected'
  },
  syncErrorMessage: {
    type: String,
    default: ''
  },
  externalContributions: [{
    repoName: String,
    repoOwner: String,
    url: String,
    type: String,
    title: String,
    isMerged: Boolean,
    createdAt: Date
  }],

  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const GithubStats = mongoose.model('GithubStats', githubStatsSchema);
module.exports = GithubStats;
