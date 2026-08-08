const cron = require('node-cron');
const User = require('../models/User');
const githubService = require('../services/githubService');
const leaderboardService = require('../services/leaderboardService');

// Helper to pause execution for a small delay
const delay = ms => new Promise(res => setTimeout(res, ms));

const syncAllLinkedGithubAccounts = async () => {
    console.log('[CRON] Starting GitHub Data Sync for all linked accounts...');
    try {
        // Fetch users who have linked github accounts
        const users = await User.find({ githubLinked: true, githubUsername: { $ne: null } });
        
        console.log(`[CRON] Found ${users.length} users to sync.`);
        
        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            try {
                // Fetch data for single user
                const success = await githubService.syncUser(user._id, user.githubUsername);
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                console.error(`[CRON] Error syncing user ${user.githubUsername}:`, err.message);
                failCount++;
            }
            
            // Respect API limits with a small 2-second delay between users
            await delay(2000);
        }

        if (successCount > 0) {
            console.log('[CRON] Recomputing leaderboards...');
            await leaderboardService.updateLeaderboards();
        }

        console.log(`[CRON] Sync Complete. Success: ${successCount}, Failed: ${failCount}`);

    } catch (error) {
        console.error('[CRON] Fatal error in GitHub sync job:', error);
    }
};

const initCronJobs = () => {
    // Run every 12 hours (e.g. 0 0,12 * * *)
    cron.schedule('0 0,12 * * *', () => {
        syncAllLinkedGithubAccounts();
    });
    
    console.log('[CRON] GitHub 12-hour Sync Job Initialized.');
};

module.exports = initCronJobs;
