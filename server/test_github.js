const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGODB_URI);

const GithubStats = require('./models/GithubStats');
const githubService = require('./services/githubService');
const User = require('./models/User');

const testLinking = async () => {
    try {
        const user = await User.findOne({ role: 'student' }); // Get standard student
        if (!user) {
            console.log("No student found to test.");
            return;
        }

        console.log("Testing syncUser with user:", user._id);
        const success = await githubService.syncUser(user._id, 'M-Kishore732006');
        
        console.log("Sync User Success?", success);
        process.exit(0);
    } catch (e) {
        console.error("FATAL CRASH:", e);
        process.exit(1);
    }
}

testLinking();
