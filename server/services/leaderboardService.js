const GithubStats = require('../models/GithubStats');

/**
 * Recalculate ranks for all students. 
 * Should be called periodically or after major data shifts.
 */
const updateLeaderboards = async () => {
    try {
        // Fetch all stats sorted by score descending
        const allStats = await GithubStats.find().sort({ contributionScore: -1 }).populate('user', 'department');
        
        let currentRank = 1;

        // Update overall rank
        // To handle ties realistically, we could use a standard competition ranking algorithm
        // For simplicity right now, it strictly sorts by score.

        for (const stat of allStats) {
            // Ideally we store rank inside GithubStats or User
            // The prompt says "Save both ranks in MongoDB". 
            // We will add overallRank and departmentRank to GithubStats if not present.
            stat.overallRank = currentRank++;

            // Wait, we need to save this efficiently.
            await stat.save();
        }

        // Now by department
        const departments = [...new Set(allStats.map(s => s.user?.department).filter(Boolean))];
        
        for (const dept of departments) {
            const deptStats = allStats.filter(s => s.user?.department === dept);
            let deptRank = 1;
            for (const stat of deptStats) {
                stat.departmentRank = deptRank++;
                await stat.save(); // Note: for production, bulkWrite is much faster. Using save() for simplicity.
            }
        }
        
    } catch (error) {
        console.error("Error updating leaderboards:", error);
    }
};

module.exports = {
    updateLeaderboards
};
