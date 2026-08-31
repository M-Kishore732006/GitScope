const User = require('../models/User');
const GithubStats = require('../models/GithubStats');
const SystemSettings = require('../models/SystemSettings');
const Notification = require('../models/Notification');
const githubService = require('../services/githubService');
const bcrypt = require('bcrypt');

// Helper to get system settings
const getSystemSettingsDoc = async () => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  return settings;
};

// Helper: Ensure student belongs to Staff member
const getAssignedStudentIds = async (staffId) => {
  const staff = await User.findById(staffId);
  const staffArray = staff?.assignedStudents || [];

  const assignedStudents = await User.find({
    role: 'student',
    $or: [
      { assignedStaff: staffId },
      { _id: { $in: staffArray } }
    ]
  }).select('_id');

  return assignedStudents.map(s => s._id.toString());
};

// ==========================================
// 1. STAFF DASHBOARD OVERVIEW
// ==========================================
const getStaffDashboard = async (req, res) => {
  try {
    const assignedIds = await getAssignedStudentIds(req.user._id);

    const totalAssignedStudents = assignedIds.length;
    const assignedStudents = await User.find({ _id: { $in: assignedIds } }).select('fullName username email rollNumber department year section githubUsername githubLinked status');

    const connectedStudents = assignedStudents.filter(s => s.githubLinked).length;
    const notConnectedStudents = totalAssignedStudents - connectedStudents;

    const statsList = await GithubStats.find({ user: { $in: assignedIds } });
    const settings = await getSystemSettingsDoc();
    const thresholdDays = settings.inactivityThresholdDays || 14;
    const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

    let totalRepositories = 0;
    let totalCommits = 0;
    let totalPullRequests = 0;
    let totalIssues = 0;
    let openSourceContributions = 0;
    let activeStudents = 0;
    let inactiveStudents = 0;

    statsList.forEach(stat => {
      totalRepositories += stat.totalRepositories || 0;
      totalCommits += stat.totalCommits || 0;
      totalPullRequests += stat.mergedPullRequests || stat.totalPullRequests || 0;
      totalIssues += stat.totalIssues || 0;
      
      const extPRs = (stat.externalContributions || []).filter(c => c.type === 'PR');
      openSourceContributions += extPRs.length;

      const isRecentlyActive = stat.lastUpdated && new Date(stat.lastUpdated) >= thresholdDate;
      if (isRecentlyActive) activeStudents++;
      else inactiveStudents++;
    });

    // Top contributors among assigned students
    const topContributors = statsList
      .sort((a, b) => (b.contributionScore || 0) - (a.contributionScore || 0))
      .slice(0, 5)
      .map(s => {
        const student = assignedStudents.find(st => st._id.toString() === s.user.toString());
        return {
          id: s.user,
          name: student?.fullName || student?.username || 'Student',
          githubUsername: s.githubUsername,
          department: student?.department || '',
          score: s.contributionScore || 0,
          commits: s.totalCommits || 0,
          prs: s.mergedPullRequests || 0,
          level: s.level || 'Bronze'
        };
      });

    res.json({
      summary: {
        totalAssignedStudents,
        connectedStudents,
        notConnectedStudents,
        activeStudents,
        inactiveStudents,
        totalRepositories,
        totalCommits,
        totalPullRequests,
        totalIssues,
        openSourceContributions
      },
      topContributors
    });
  } catch (error) {
    console.error('Error fetching staff dashboard:', error);
    res.status(500).json({ message: 'Failed to load staff dashboard overview' });
  }
};

// ==========================================
// 2. MY STUDENTS (Assigned Students List)
// ==========================================
const getAssignedStudentsList = async (req, res) => {
  try {
    const assignedIds = await getAssignedStudentIds(req.user._id);
    const { department, year, section, githubConnected, activeStatus, search } = req.query;

    const query = { _id: { $in: assignedIds }, role: 'student' };

    if (department) query.department = department;
    if (year) query.year = year;
    if (section) query.section = section;
    if (githubConnected !== undefined && githubConnected !== '') {
      query.githubLinked = githubConnected === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { username: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex },
        { githubUsername: searchRegex }
      ];
    }

    const students = await User.find(query).select('-password');
    const statsList = await GithubStats.find({ user: { $in: students.map(s => s._id) } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    const settings = await getSystemSettingsDoc();
    const thresholdDays = settings.inactivityThresholdDays || 14;
    const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

    let result = students.map(st => {
      const stat = statsMap[st._id.toString()];
      const lastActivityDate = stat?.lastUpdated ? new Date(stat.lastUpdated) : null;
      const isRecentlyActive = lastActivityDate && lastActivityDate >= thresholdDate;

      return {
        _id: st._id,
        fullName: st.fullName || st.username,
        username: st.username,
        rollNumber: st.rollNumber || 'N/A',
        email: st.email,
        department: st.department || 'Unassigned',
        year: st.year || 'N/A',
        section: st.section || 'N/A',
        githubUsername: st.githubUsername || 'Not Connected',
        githubLinked: st.githubLinked,
        status: st.status,
        activityStatus: !st.githubLinked ? 'Not Connected' : (isRecentlyActive ? 'Active' : 'Inactive'),
        lastGithubActivity: lastActivityDate,
        contributionScore: stat?.contributionScore || 0,
        level: stat?.level || 'Bronze',
        totalCommits: stat?.totalCommits || 0,
        totalPRs: stat?.mergedPullRequests || stat?.totalPullRequests || 0,
        totalIssues: stat?.totalIssues || 0,
        totalRepositories: stat?.totalRepositories || 0
      };
    });

    if (activeStatus) {
      if (activeStatus === 'active') result = result.filter(r => r.activityStatus === 'Active');
      if (activeStatus === 'inactive') result = result.filter(r => r.activityStatus === 'Inactive');
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    res.status(500).json({ message: 'Failed to fetch assigned students list' });
  }
};

// ==========================================
// 3. STUDENT PROFILE & TELEMETRY
// ==========================================
const getStudentProfileDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const assignedIds = await getAssignedStudentIds(req.user._id);

    if (!assignedIds.includes(id)) {
      return res.status(403).json({ message: 'Access Denied: Student is not assigned to you.' });
    }

    const student = await User.findById(id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const stats = await GithubStats.findOne({ user: student._id });

    res.json({
      student: {
        _id: student._id,
        fullName: student.fullName || student.username,
        username: student.username,
        rollNumber: student.rollNumber,
        email: student.email,
        department: student.department,
        year: student.year,
        section: student.section,
        phoneNumber: student.phoneNumber,
        status: student.status,
        githubUsername: student.githubUsername,
        githubLinked: student.githubLinked,
        createdAt: student.createdAt
      },
      stats: stats || {
        totalRepositories: 0,
        totalCommits: 0,
        totalPullRequests: 0,
        mergedPullRequests: 0,
        totalIssues: 0,
        reviews: 0,
        contributionScore: 0,
        level: 'Bronze',
        syncStatus: student.githubLinked ? 'Connected' : 'Not Connected',
        lastUpdated: null,
        repositoriesList: [],
        externalContributions: []
      }
    });
  } catch (error) {
    console.error('Error fetching student profile details:', error);
    res.status(500).json({ message: 'Failed to fetch student details' });
  }
};

// ==========================================
// 4. GITHUB ACTIVITY TIMELINE
// ==========================================
const getStudentActivityTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const assignedIds = await getAssignedStudentIds(req.user._id);

    if (!assignedIds.includes(id)) {
      return res.status(403).json({ message: 'Access Denied: Student is not assigned to you.' });
    }

    const stats = await GithubStats.findOne({ user: id });
    if (!stats) {
      return res.json([]);
    }

    // Build timeline events from commits, PRs, issues, external contributions
    const timeline = [];

    (stats.repositoriesList || []).forEach(repo => {
      if (repo.updatedAt) {
        timeline.push({
          date: new Date(repo.updatedAt),
          type: 'REPOSITORY',
          title: `Updated repository ${repo.name}`,
          repository: repo.name,
          details: repo.description || 'No description',
          url: repo.htmlUrl
        });
      }
    });

    (stats.externalContributions || []).forEach(contrib => {
      timeline.push({
        date: new Date(contrib.date || Date.now()),
        type: contrib.type === 'PR' ? 'PULL_REQUEST' : 'ISSUE',
        title: `${contrib.isMerged ? 'Merged' : 'Opened'} ${contrib.type} in ${contrib.repoName}`,
        repository: contrib.repoName,
        details: contrib.title,
        status: contrib.isMerged ? 'Merged' : 'Open',
        url: contrib.url
      });
    });

    // Add recent simulated commit calendar markers if present
    if (stats.contributionCalendar && stats.contributionCalendar.length > 0) {
      stats.contributionCalendar
        .filter(c => c.count > 0)
        .slice(-10)
        .forEach(c => {
          timeline.push({
            date: new Date(c.date),
            type: 'COMMIT',
            title: `Pushed ${c.count} commit${c.count > 1 ? 's' : ''}`,
            repository: 'Multiple Repositories',
            details: `Recorded ${c.count} contribution events`
          });
        });
    }

    timeline.sort((a, b) => b.date - a.date);

    res.json(timeline.slice(0, 30));
  } catch (error) {
    console.error('Error fetching student activity timeline:', error);
    res.status(500).json({ message: 'Failed to fetch activity timeline' });
  }
};

// ==========================================
// 5. REPOSITORIES
// ==========================================
const getStudentRepositories = async (req, res) => {
  try {
    const { id } = req.params;
    const assignedIds = await getAssignedStudentIds(req.user._id);

    if (!assignedIds.includes(id)) {
      return res.status(403).json({ message: 'Access Denied' });
    }

    const stats = await GithubStats.findOne({ user: id });
    const repos = stats?.repositoriesList || [];

    res.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ message: 'Failed to fetch repositories' });
  }
};

// ==========================================
// 6. OPEN SOURCE CONTRIBUTIONS
// ==========================================
const getStudentOpenSource = async (req, res) => {
  try {
    const { id } = req.params;
    const assignedIds = await getAssignedStudentIds(req.user._id);

    if (!assignedIds.includes(id)) {
      return res.status(403).json({ message: 'Access Denied' });
    }

    const student = await User.findById(id);
    const stats = await GithubStats.findOne({ user: id });

    if (!stats) {
      return res.json({
        summary: { externalProjects: 0, externalPRs: 0, mergedPRs: 0, externalIssues: 0, externalCommits: 0 },
        contributions: []
      });
    }

    const studentGithub = (student.githubUsername || '').toLowerCase();
    const extContributions = stats.externalContributions || [];

    const externalPRsList = extContributions.filter(c => c.type === 'PR');
    const mergedPRsList = externalPRsList.filter(c => c.isMerged);
    const externalIssuesList = extContributions.filter(c => c.type === 'ISSUE');

    // External projects count
    const uniqueRepos = new Set(extContributions.map(c => c.repoName));

    res.json({
      summary: {
        externalProjects: uniqueRepos.size,
        externalPRs: externalPRsList.length,
        mergedPRs: mergedPRsList.length,
        externalIssues: externalIssuesList.length,
        externalCommits: Math.round(externalPRsList.length * 3)
      },
      contributions: extContributions
    });
  } catch (error) {
    console.error('Error fetching open source contributions:', error);
    res.status(500).json({ message: 'Failed to fetch open source contributions' });
  }
};

// ==========================================
// 7. ACTIVITY MONITORING & INACTIVITY DETECTION
// ==========================================
const getActivityMonitoring = async (req, res) => {
  try {
    const assignedIds = await getAssignedStudentIds(req.user._id);
    const students = await User.find({ _id: { $in: assignedIds } }).select('fullName username email rollNumber department year section githubUsername githubLinked');
    const statsList = await GithubStats.find({ user: { $in: assignedIds } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    const now = new Date();

    const monitoredStudents = students.map(st => {
      const stat = statsMap[st._id.toString()];
      const lastActivity = stat?.lastUpdated ? new Date(stat.lastUpdated) : null;
      let daysSinceActivity = lastActivity ? Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24)) : 999;

      let activityLevel = 'Inactive';
      if (st.githubLinked) {
        if (daysSinceActivity <= 3) activityLevel = 'Highly Active';
        else if (daysSinceActivity <= 7) activityLevel = 'Active';
        else if (daysSinceActivity <= 14) activityLevel = 'Moderately Active';
        else if (daysSinceActivity <= 30) activityLevel = 'Low Activity';
        else activityLevel = 'Inactive';
      }

      return {
        studentId: st._id,
        name: st.fullName || st.username,
        rollNumber: st.rollNumber,
        department: st.department,
        githubUsername: st.githubUsername || 'Not Connected',
        githubLinked: st.githubLinked,
        lastActivity,
        daysSinceActivity: daysSinceActivity === 999 ? 'N/A' : daysSinceActivity,
        commits: stat?.totalCommits || 0,
        prs: stat?.mergedPullRequests || stat?.totalPullRequests || 0,
        issues: stat?.totalIssues || 0,
        activityLevel
      };
    });

    res.json(monitoredStudents);
  } catch (error) {
    console.error('Error fetching activity monitoring:', error);
    res.status(500).json({ message: 'Failed to fetch activity monitoring data' });
  }
};

// ==========================================
// 8. STUDENT COMPARISON
// ==========================================
const compareStudents = async (req, res) => {
  try {
    const studentIdsStr = req.query.studentIds || '';
    const requestedIds = studentIdsStr.split(',').filter(Boolean);

    const assignedIds = await getAssignedStudentIds(req.user._id);
    const validIds = requestedIds.filter(id => assignedIds.includes(id));

    if (validIds.length === 0) {
      return res.status(400).json({ message: 'Please select valid assigned students to compare.' });
    }

    const students = await User.find({ _id: { $in: validIds } }).select('fullName username rollNumber department year section githubUsername');
    const statsList = await GithubStats.find({ user: { $in: validIds } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    const comparison = students.map(st => {
      const stat = statsMap[st._id.toString()] || {};
      const extPRs = (stat.externalContributions || []).filter(c => c.type === 'PR');

      return {
        studentId: st._id,
        name: st.fullName || st.username,
        githubUsername: st.githubUsername || 'N/A',
        department: st.department,
        repositories: stat.totalRepositories || 0,
        commits: stat.totalCommits || 0,
        pullRequests: stat.mergedPullRequests || stat.totalPullRequests || 0,
        issues: stat.totalIssues || 0,
        reviews: stat.reviews || 0,
        openSource: extPRs.length,
        score: stat.contributionScore || 0,
        level: stat.level || 'Bronze'
      };
    });

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing students:', error);
    res.status(500).json({ message: 'Failed to compare student activity' });
  }
};

// ==========================================
// 9. STUDENT RANKINGS (Assigned Only)
// ==========================================
const getAssignedRankings = async (req, res) => {
  try {
    const { department, year, section, sortBy = 'score', period = 'all' } = req.query;

    const assignedIds = await getAssignedStudentIds(req.user._id);

    const query = { _id: { $in: assignedIds }, role: 'student' };
    if (department) query.department = department;
    if (year) query.year = year;
    if (section) query.section = section;

    const students = await User.find(query).select('fullName username rollNumber department year section githubUsername');
    const studentIds = students.map(s => s._id);

    const statsList = await GithubStats.find({ user: { $in: studentIds } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    let rankings = students.map(st => {
      const stat = statsMap[st._id.toString()] || {};
      const extPRs = (stat.externalContributions || []).filter(c => c.type === 'PR');

      return {
        studentId: st._id,
        name: st.fullName || st.username,
        rollNumber: st.rollNumber,
        department: st.department,
        year: st.year,
        section: st.section,
        githubUsername: st.githubUsername || 'Not Connected',
        commits: stat.totalCommits || 0,
        prs: stat.mergedPullRequests || stat.totalPullRequests || 0,
        issues: stat.totalIssues || 0,
        openSource: extPRs.length,
        score: stat.contributionScore || 0,
        level: stat.level || 'Bronze'
      };
    });

    // Sorting logic
    rankings.sort((a, b) => {
      if (sortBy === 'commits') return b.commits - a.commits;
      if (sortBy === 'prs') return b.prs - a.prs;
      if (sortBy === 'issues') return b.issues - a.issues;
      if (sortBy === 'openSource') return b.openSource - a.openSource;
      return b.score - a.score;
    });

    // Attach ranks
    rankings = rankings.map((r, idx) => ({ ...r, rank: idx + 1 }));

    res.json(rankings);
  } catch (error) {
    console.error('Error fetching assigned rankings:', error);
    res.status(500).json({ message: 'Failed to fetch student rankings' });
  }
};

// ==========================================
// 10. STAFF ANALYTICS
// ==========================================
const getStaffAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const assignedIds = await getAssignedStudentIds(req.user._id);

    const students = await User.find({ _id: { $in: assignedIds } }).select('department githubLinked');
    const statsList = await GithubStats.find({ user: { $in: assignedIds } });

    let totalRepos = 0, totalCommits = 0, totalPRs = 0, totalIssues = 0;
    const langMap = {};
    const monthlyMap = {};

    statsList.forEach(stat => {
      totalRepos += stat.totalRepositories || 0;
      totalCommits += stat.totalCommits || 0;
      totalPRs += stat.mergedPullRequests || stat.totalPullRequests || 0;
      totalIssues += stat.totalIssues || 0;

      if (stat.languageUsage) {
        stat.languageUsage.forEach(l => {
          langMap[l.language] = (langMap[l.language] || 0) + (l.count || 1);
        });
      }

      if (stat.contributionCalendar) {
        stat.contributionCalendar.forEach(day => {
          if (day.count > 0 && day.date) {
            const d = new Date(day.date);
            const key = d.toLocaleString('default', { month: 'short' });
            monthlyMap[key] = (monthlyMap[key] || 0) + day.count;
          }
        });
      }
    });

    const languageDistribution = Object.keys(langMap).map(k => ({ language: k, count: langMap[k] }));
    const monthlyCommitTrends = Object.keys(monthlyMap).map(k => ({ month: k, commits: monthlyMap[k] }));

    res.json({
      totals: {
        assignedStudents: assignedIds.length,
        repositories: totalRepos,
        commits: totalCommits,
        pullRequests: totalPRs,
        issues: totalIssues
      },
      languageDistribution,
      monthlyCommitTrends
    });
  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    res.status(500).json({ message: 'Failed to fetch staff analytics' });
  }
};

// ==========================================
// 11. REPORTS GENERATOR FOR ASSIGNED STUDENTS
// ==========================================
const generateStaffReport = async (req, res) => {
  try {
    const { reportType, studentId, startDate, endDate, format = 'json' } = req.query;
    const assignedIds = await getAssignedStudentIds(req.user._id);

    let targetIds = assignedIds;
    if (studentId) {
      if (!assignedIds.includes(studentId)) {
        return res.status(403).json({ message: 'Access Denied: Target student is not assigned to you.' });
      }
      targetIds = [studentId];
    }

    const students = await User.find({ _id: { $in: targetIds } }).select('-password');
    const statsList = await GithubStats.find({ user: { $in: targetIds } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    const reportData = students.map(st => {
      const stat = statsMap[st._id.toString()] || {};
      const extPRs = (stat.externalContributions || []).filter(c => c.type === 'PR');

      return {
        studentId: st._id,
        fullName: st.fullName || st.username,
        rollNumber: st.rollNumber || 'N/A',
        email: st.email,
        department: st.department,
        year: st.year,
        section: st.section,
        githubUsername: st.githubUsername || 'Not Connected',
        repositories: stat.totalRepositories || 0,
        commits: stat.totalCommits || 0,
        pullRequests: stat.mergedPullRequests || stat.totalPullRequests || 0,
        issues: stat.totalIssues || 0,
        openSourcePRs: extPRs.length,
        score: stat.contributionScore || 0,
        lastSync: stat.lastUpdated || null
      };
    });

    if (format === 'csv') {
      const headers = ['Student ID', 'Full Name', 'Roll Number', 'Email', 'Department', 'Year', 'Section', 'GitHub', 'Repos', 'Commits', 'PRs', 'Issues', 'Open Source PRs', 'Score'];
      const csvRows = [headers.join(',')];
      reportData.forEach(r => {
        csvRows.push([
          `"${r.studentId}"`,
          `"${r.fullName}"`,
          `"${r.rollNumber}"`,
          `"${r.email}"`,
          `"${r.department}"`,
          `"${r.year}"`,
          `"${r.section}"`,
          `"${r.githubUsername}"`,
          r.repositories,
          r.commits,
          r.pullRequests,
          r.issues,
          r.openSourcePRs,
          r.score
        ].join(','));
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Staff_Report_${Date.now()}.csv`);
      return res.send(csvRows.join('\n'));
    }

    res.json({
      title: `${reportType || 'Student GitHub Summary'} Report`,
      generatedAt: new Date(),
      generatedBy: req.user.fullName || req.user.email,
      totalStudents: reportData.length,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating staff report:', error);
    res.status(500).json({ message: 'Failed to generate staff report' });
  }
};

// ==========================================
// 12. STAFF NOTIFICATIONS
// ==========================================
const getStaffNotifications = async (req, res) => {
  try {
    const assignedIds = await getAssignedStudentIds(req.user._id);
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { user: { $in: assignedIds } }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching staff notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// ==========================================
// 13. STAFF PROFILE MANAGEMENT
// ==========================================
const getStaffProfile = async (req, res) => {
  try {
    const staff = await User.findById(req.user._id).select('-password');
    const assignedIds = await getAssignedStudentIds(req.user._id);

    res.json({
      _id: staff._id,
      fullName: staff.fullName || staff.username,
      username: staff.username,
      email: staff.email,
      rollNumber: staff.rollNumber,
      department: staff.department,
      phoneNumber: staff.phoneNumber,
      role: staff.role === 'teacher' ? 'staff' : staff.role,
      status: staff.status,
      assignedStudentsCount: assignedIds.length
    });
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const updateStaffProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const staff = await User.findById(req.user._id);

    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    if (fullName) staff.fullName = fullName;
    if (phoneNumber) staff.phoneNumber = phoneNumber;

    await staff.save();

    res.json({ message: 'Profile updated successfully', staff: { fullName: staff.fullName, phoneNumber: staff.phoneNumber } });
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const changeStaffPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const staff = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, staff.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    staff.password = newPassword;
    staff.mustChangePassword = false;
    await staff.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing staff password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// Sync assigned student GitHub telemetry
const syncStudentGithub = async (req, res) => {
  try {
    const { id } = req.params;
    const assignedIds = await getAssignedStudentIds(req.user._id);

    if (!assignedIds.includes(id)) {
      return res.status(403).json({ message: 'Access Denied: Student is not assigned to you.' });
    }

    const student = await User.findById(id);
    if (!student || !student.githubUsername || !student.githubLinked) {
      return res.status(400).json({ message: 'Student does not have a linked GitHub account.' });
    }

    const success = await githubService.syncUser(student._id, student.githubUsername);
    if (success) {
      await GithubStats.updateOne({ user: student._id }, { syncStatus: 'Connected', syncErrorMessage: '' });
      res.json({ message: `Successfully synchronized data for @${student.githubUsername}` });
    } else {
      res.status(502).json({ message: `Failed to sync GitHub data for @${student.githubUsername}` });
    }
  } catch (error) {
    console.error('Error syncing student GitHub:', error);
    res.status(500).json({ message: 'Failed to sync GitHub data' });
  }
};

module.exports = {
  getStaffDashboard,
  getAssignedStudentsList,
  getStudentProfileDetails,
  getStudentActivityTimeline,
  getStudentRepositories,
  getStudentOpenSource,
  getActivityMonitoring,
  compareStudents,
  getAssignedRankings,
  getStaffAnalytics,
  generateStaffReport,
  getStaffNotifications,
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
  syncStudentGithub
};
