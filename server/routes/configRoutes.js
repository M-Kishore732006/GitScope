const express = require('express');
const router = express.Router();

// @desc    Get Github Client ID
// @route   GET /api/config/github
// @access  Public
router.get('/github', (req, res) => {
    res.json({ clientId: process.env.GITHUB_CLIENT_ID });
});

module.exports = router;
