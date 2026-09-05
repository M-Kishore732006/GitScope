const GithubStats = require('../models/GithubStats');
const SystemSettings = require('../models/SystemSettings');
const { evaluateAchievements } = require('./achievementService');
const leaderboardService = require('./leaderboardService');

/**
 * Calculate the Contribution Score based on defined weights
 */
const calculateContributionScore = (stats, weights = null) => {
  let score = 0;

  const commitWeight = weights?.commitPoints !== undefined ? Number(weights.commitPoints) : 1;
  const mergedPrWeight = weights?.mergedPrPoints !== undefined ? Number(weights.mergedPrPoints) : 5;
  const openPrWeight = weights?.prPoints !== undefined ? Number(weights.prPoints) : 0;
  const issueWeight = weights?.issuePoints !== undefined ? Number(weights.issuePoints) : (weights ? Number(weights.issuePoints || 0) : 10);
  const reviewWeight = weights?.reviewPoints !== undefined ? Number(weights.reviewPoints) : (weights ? Number(weights.reviewPoints || 0) : 8);
  const repoWeight = weights?.repoPoints !== undefined ? Number(weights.repoPoints) : 1;

  // Commits & Merged Pull Requests
  score += (stats.totalCommits || 0) * commitWeight;
  score += (stats.mergedPullRequests || 0) * mergedPrWeight;
  
  // Open PRs
  const openPRs = Math.max(0, (stats.totalPullRequests || 0) - (stats.mergedPullRequests || 0));
  score += openPRs * openPrWeight;
  
  // Issues & Reviews
  score += (stats.totalIssues || 0) * issueWeight;
  score += (stats.reviews || 0) * reviewWeight;
  
  // Repositories = 1 point each
  score += (stats.totalRepositories || 0) * repoWeight;

  // Base ecosystem activity
  score += (stats.totalStars || 0) * 2;
  score += (stats.contributionStreak || 0) * 2;

  // Safety catch for negative anomalies
  return Math.max(0, score);
};

/**
 * Recalculate scores and ranks for all students across the system
 */
const recalculateAllScores = async (customSettings = null) => {
  let settings = customSettings;
  if (!settings) {
    settings = await SystemSettings.findOne();
  }

  const allStats = await GithubStats.find();

  for (const stat of allStats) {
    const newScore = calculateContributionScore(stat, settings);
    stat.contributionScore = newScore;

    const { achievements, level } = evaluateAchievements(stat, stat.achievements);
    stat.achievements = achievements;
    stat.level = level;
    stat.lastUpdated = new Date();

    await stat.save();
  }

  // Update overall and department ranks
  await leaderboardService.updateLeaderboards();
  return allStats.length;
};

module.exports = {
  calculateContributionScore,
  recalculateAllScores
};
