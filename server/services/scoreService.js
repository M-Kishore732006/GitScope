/**
 * Calculate the Contribution Score based on defined weights
 */
const calculateContributionScore = (stats) => {
  let score = 0;

  // Commit = 1
  score += (stats.totalCommits || 0) * 1;
  
  // Merged Pull Request = 25
  score += (stats.mergedPullRequests || 0) * 25;
  
  // Issue = 10
  score += (stats.totalIssues || 0) * 10;
  
  // Repository = 15
  score += (stats.totalRepositories || 0) * 15;
  
  // Code Review = 8 (Assuming we fetch Reviews, if present)
  score += (stats.reviews || 0) * 8;
  
  // Star = 2
  score += (stats.totalStars || 0) * 2;
  
  // Contribution Streak = 2 points per day
  score += (stats.contributionStreak || 0) * 2;

  // Safety catch for negative anomalies
  return Math.max(0, score);
};

module.exports = {
  calculateContributionScore
};
