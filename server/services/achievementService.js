/**
 * Evaluates statistics and determines unlocked achievements.
 */
const evaluateAchievements = (stats, currentAchievements = []) => {
    const unlocked = [...currentAchievements];
    
    // Helper to check if already unlocked
    const isUnlocked = (name) => unlocked.some(ach => ach.name === name && ach.earnedAt);
    
    const award = (name, description) => {
      if (!isUnlocked(name)) {
        unlocked.push({ name, description, earnedAt: new Date() });
      }
    };
  
    // Logic Rules
    if (stats.totalCommits >= 1) award("First Commit", "Made your first GitHub commit");
    if (stats.totalCommits >= 100) award("100 Commits", "Reached 100 total commits");
    if (stats.totalCommits >= 500) award("500 Commits", "Reached 500 total commits");
    if (stats.totalCommits >= 1000) award("1000 Commits", "Wow! 1000 commits");
  
    if (stats.totalPullRequests >= 1) award("First Pull Request", "Opened your first PR");
    if (stats.mergedPullRequests >= 1) award("First Merge", "Got a PR merged successfully");
  
    if (stats.contributionStreak >= 7) award("1-Week Streak", "Coded for 7 consecutive days");
    if (stats.contributionStreak >= 30) award("30-Day Streak", "Incredible 30 day coding streak");
    if (stats.contributionStreak >= 100) award("100-Day Streak", "Legendary 100 day streak!");
  
    // Calculate Level
    let level = 'Bronze';
    if (stats.contributionScore >= 100) level = 'Silver';
    if (stats.contributionScore >= 500) level = 'Gold';
    if (stats.contributionScore >= 2500) level = 'Platinum';
    if (stats.contributionScore >= 10000) level = 'Diamond';
    if (stats.contributionScore >= 50000) level = 'Legend';
  
    return {
      achievements: unlocked,
      level
    };
  };
  
  module.exports = {
    evaluateAchievements
  };
