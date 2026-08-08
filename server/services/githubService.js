const axios = require('axios');
const GithubStats = require('../models/GithubStats');
const { calculateContributionScore } = require('./scoreService');
const { evaluateAchievements } = require('./achievementService');

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const fetchGraphQLData = async (username) => {
  const query = `
    query($login: String!) {
      user(login: $login) {
        followers { totalCount }
        following { totalCount }
        repositories(first: 50, isFork: false, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            name
            url
            description
            stargazerCount
            forkCount
            createdAt
            primaryLanguage {
              name
            }
          }
        }
        pullRequests(states: MERGED) {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      GITHUB_GRAPHQL_URL,
      { query, variables: { login: username } },
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
    );
    
    if (response.data.errors) {
       console.error("GraphQL Errors:", response.data.errors);
       throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data.user;
  } catch (error) {
    console.error(`Error fetching GitHub data for ${username}:`, error.message);
    return null;
  }
};

const fetchRecentEvents = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/events/public?per_page=15`, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    return response.data.map(ev => ({
        type: ev.type || 'Event',
        repoName: ev.repo?.name || 'Unknown',
        action: ev.payload?.action || '',
        createdAt: ev.created_at ? new Date(ev.created_at) : new Date()
    })).slice(0, 10);
  } catch(e) {
    console.error(`Error fetching events for ${username}:`, e.message);
    return [];
  }
};

const calculateStreak = (calendarWeeks) => {
  let streak = 0;
  const days = [];
  calendarWeeks.forEach(week => {
    week.contributionDays.forEach(day => {
      days.push(day);
    });
  });
  
  // Start from end
  for (let i = days.length - 1; i >= 0; i--) {
      // Allow today to be 0 without breaking streak if yesterday had >0
      if (i === days.length - 1 && days[i].contributionCount === 0) continue;
      
      if (days[i].contributionCount > 0) {
          streak++;
      } else {
          break;
      }
  }
  return streak;
};

const syncUser = async (userId, githubUsername) => {
  const data = await fetchGraphQLData(githubUsername);
  if (!data) return false;

  const repos = data.repositories.nodes;
  let totalStars = 0;
  let totalForks = 0;
  const languagesMap = {};
  
  const repositoriesList = repos.map(repo => {
    totalStars += repo.stargazerCount;
    totalForks += repo.forkCount;
    
    if (repo.primaryLanguage?.name) {
       languagesMap[repo.primaryLanguage.name] = (languagesMap[repo.primaryLanguage.name] || 0) + 1;
    }

    return {
      name: repo.name,
      url: repo.url,
      description: repo.description || '',
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      primaryLanguage: repo.primaryLanguage?.name || 'Unknown',
      createdAt: repo.createdAt,
      languages: []
    };
  });

  const languageUsage = Object.keys(languagesMap).map(key => ({
      language: key,
      count: languagesMap[key]
  }));

  const calendarDays = [];
  data.contributionsCollection.contributionCalendar.weeks.forEach(w => {
     w.contributionDays.forEach(d => {
        calendarDays.push({ date: new Date(d.date), count: d.contributionCount });
     });
  });

  const contributionStreak = calculateStreak(data.contributionsCollection.contributionCalendar.weeks);
  const recentActivity = await fetchRecentEvents(githubUsername);

  const rawStats = {
     followers: data.followers.totalCount,
     following: data.following.totalCount,
     totalRepositories: data.repositories.totalCount,
     totalCommits: data.contributionsCollection.totalCommitContributions,
     totalPullRequests: data.contributionsCollection.totalPullRequestContributions,
     mergedPullRequests: data.pullRequests.totalCount, // Simplified approximation via graphql
     totalIssues: data.contributionsCollection.totalIssueContributions,
     totalStars,
     totalForks,
     contributionStreak,
     repositoriesList,
     languageUsage,
     contributionCalendar: calendarDays,
     recentActivity
  };

  rawStats.contributionScore = calculateContributionScore(rawStats);

  // Fetch or create baseline doc to evaluate achievements
  let githubDoc = await GithubStats.findOne({ user: userId });
  if (!githubDoc) {
      githubDoc = new GithubStats({ user: userId, githubUsername });
  }

  const { achievements, level } = evaluateAchievements(rawStats, githubDoc.achievements);
  rawStats.achievements = achievements;
  rawStats.level = level;
  rawStats.lastUpdated = new Date();
  
  Object.assign(githubDoc, rawStats);
  await githubDoc.save();
  return true;
};

module.exports = {
  syncUser
};
