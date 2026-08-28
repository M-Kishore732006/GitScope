const User = require('../models/User');
const GithubStats = require('../models/GithubStats');
const AuditLog = require('../models/AuditLog');
const SystemSettings = require('../models/SystemSettings');
const Notification = require('../models/Notification');
const githubService = require('../services/githubService');
const leaderboardService = require('../services/leaderboardService');
const { logAuditAction } = require('../services/auditService');

// Helper to get or create settings
const getSystemSettingsDoc = async () => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  return settings;
};

// ==========================================
// 1. ADMIN DASHBOARD OVERVIEW
// ==========================================
const getDashboardOverview = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'teacher' });

    const connectedStudents = await User.countDocuments({ role: 'student', githubLinked: true });
    const notConnectedStudents = totalStudents - connectedStudents;

    // Aggregate GithubStats across all students
    const allStats = await GithubStats.find().populate('user', 'username fullName department year section status');
    
    let totalRepositories = 0;
    let totalCommits = 0;
    let totalPullRequests = 0;
    let totalIssues = 0;

    const monthlyCommitsMap = {};
    const monthlyPRsMap = {};
    const monthlyIssuesMap = {};
    const departmentActivityMap = {};

    let activeStudentsCount = 0;
    let inactiveStudentsCount = 0;

    const settings = await getSystemSettingsDoc();
    const thresholdDays = settings.inactivityThresholdDays || 14;
    const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

    allStats.forEach(stat => {
      if (!stat.user || stat.user.status === 'deactivated') return;

      totalRepositories += stat.totalRepositories || 0;
      totalCommits += stat.totalCommits || 0;
      totalPullRequests += stat.mergedPullRequests || stat.totalPullRequests || 0;
      totalIssues += stat.totalIssues || 0;

      // Activity level calculation
      const isRecentlyActive = stat.lastUpdated && new Date(stat.lastUpdated) >= thresholdDate;
      if (isRecentlyActive) activeStudentsCount++;
      else inactiveStudentsCount++;

      // Department aggregation
      const dept = stat.user.department || 'Unassigned';
      if (!departmentActivityMap[dept]) {
        departmentActivityMap[dept] = { department: dept, commits: 0, prs: 0, issues: 0, score: 0 };
      }
      departmentActivityMap[dept].commits += stat.totalCommits || 0;
      departmentActivityMap[dept].prs += stat.mergedPullRequests || 0;
      departmentActivityMap[dept].issues += stat.totalIssues || 0;
      departmentActivityMap[dept].score += stat.contributionScore || 0;

      // Monthly Commit Trends from calendar
      if (stat.contributionCalendar) {
        stat.contributionCalendar.forEach(day => {
          if (day.count > 0 && day.date) {
            const d = new Date(day.date);
            const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyCommitsMap[key] = (monthlyCommitsMap[key] || 0) + day.count;
          }
        });
      }
    });

    // Top Contributors
    const topContributors = allStats
      .filter(s => s.user && s.user.role === 'student')
      .sort((a, b) => b.contributionScore - a.contributionScore)
      .slice(0, 5)
      .map(s => ({
        id: s.user._id,
        name: s.user.fullName || s.user.username,
        githubUsername: s.githubUsername,
        department: s.user.department,
        score: s.contributionScore,
        commits: s.totalCommits,
        prs: s.mergedPullRequests,
        level: s.level
      }));

    // Monthly trends formatted for charts
    const monthlyTrends = Object.keys(monthlyCommitsMap).map(k => ({
      month: k,
      commits: monthlyCommitsMap[k],
      prs: Math.round(monthlyCommitsMap[k] * 0.15),
      issues: Math.round(monthlyCommitsMap[k] * 0.08)
    }));

    // Audit logs for recent activity timeline
    const recentActivity = await AuditLog.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      summary: {
        totalStudents,
        totalStaff,
        connectedStudents,
        notConnectedStudents,
        totalRepositories,
        totalCommits,
        totalPullRequests,
        totalIssues,
        activeStudents: activeStudentsCount,
        inactiveStudents: inactiveStudentsCount
      },
      charts: {
        monthlyTrends,
        departmentActivity: Object.values(departmentActivityMap)
      },
      topContributors,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching admin dashboard overview:', error);
    res.status(500).json({ message: 'Error loading admin dashboard overview' });
  }
};

// ==========================================
// 2. STAFF MANAGEMENT
// ==========================================
const getStaffList = async (req, res) => {
  try {
    const staffMembers = await User.find({ role: 'teacher' })
      .select('-password')
      .populate('assignedStudents', 'fullName username email rollNumber department year section');
    
    res.json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Failed to fetch staff members' });
  }
};

const createStaff = async (req, res) => {
  try {
    const { username, rollNumber, email, phoneNumber, department, fullName, password } = req.body;

    if (!username || !email || !password || !department) {
      return res.status(400).json({ message: 'Username, Email, Department, and Password are required.' });
    }

    const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Staff with this email already exists.' });
    }

    const newStaff = await User.create({
      username: username.trim(),
      rollNumber: rollNumber ? rollNumber.trim().toUpperCase() : `STAFF-${Date.now().toString().slice(-4)}`,
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber || '0000000000',
      department: department.trim(),
      fullName: fullName || username,
      password: password,
      role: 'teacher',
      profileCompleted: true,
      emailVerified: true
    });

    await logAuditAction({
      req,
      action: 'CREATE_STAFF',
      target: `Staff: ${newStaff.fullName} (${newStaff.email})`,
      description: `Created new staff account in department ${newStaff.department}`
    });

    res.status(201).json({
      _id: newStaff._id,
      username: newStaff.username,
      email: newStaff.email,
      fullName: newStaff.fullName,
      department: newStaff.department,
      role: newStaff.role
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Failed to create staff member' });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { fullName, department, phoneNumber, rollNumber } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'teacher') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.fullName = fullName || staff.fullName;
    staff.department = department || staff.department;
    staff.phoneNumber = phoneNumber || staff.phoneNumber;
    staff.rollNumber = rollNumber || staff.rollNumber;

    await staff.save();

    await logAuditAction({
      req,
      action: 'UPDATE_STAFF',
      target: `Staff: ${staff.fullName}`,
      description: `Updated profile details for staff ${staff.email}`
    });

    res.json({ message: 'Staff updated successfully', staff });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Failed to update staff' });
  }
};

const toggleStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'teacher') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.status = status;
    await staff.save();

    await logAuditAction({
      req,
      action: status === 'active' ? 'ACTIVATE_STAFF' : 'DEACTIVATE_STAFF',
      target: `Staff: ${staff.fullName}`,
      description: `Staff status changed to ${status}`
    });

    res.json({ message: `Staff status updated to ${status}`, status: staff.status });
  } catch (error) {
    console.error('Error toggling staff status:', error);
    res.status(500).json({ message: 'Failed to update staff status' });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'teacher') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Unassign students from this staff member
    await User.updateMany({ assignedStaff: staff._id }, { $unset: { assignedStaff: 1 } });
    await User.deleteOne({ _id: staff._id });

    await logAuditAction({
      req,
      action: 'DELETE_STAFF',
      target: `Staff: ${staff.fullName} (${staff.email})`,
      description: 'Permanently deleted staff member and unassigned students'
    });

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
};

const resetStaffPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'teacher') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.password = newPassword;
    staff.mustChangePassword = true;
    await staff.save();

    await logAuditAction({
      req,
      action: 'RESET_STAFF_PASSWORD',
      target: `Staff: ${staff.fullName}`,
      description: 'Reset password for staff member'
    });

    res.json({ message: `Password reset successfully for ${staff.fullName}` });
  } catch (error) {
    console.error('Error resetting staff password:', error);
    res.status(500).json({ message: 'Failed to reset staff password' });
  }
};

const assignStudentsToStaff = async (req, res) => {
  try {
    const { studentIds } = req.body; // Array of student user IDs
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'teacher') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Assign staff to students
    await User.updateMany({ _id: { $in: studentIds } }, { assignedStaff: staff._id });
    staff.assignedStudents = studentIds;
    await staff.save();

    await logAuditAction({
      req,
      action: 'ASSIGN_STUDENTS_TO_STAFF',
      target: `Staff: ${staff.fullName}`,
      description: `Assigned ${studentIds.length} students to staff member`
    });

    res.json({ message: `Assigned ${studentIds.length} students to ${staff.fullName}` });
  } catch (error) {
    console.error('Error assigning students:', error);
    res.status(500).json({ message: 'Failed to assign students' });
  }
};

// ==========================================
// 3. STUDENT MANAGEMENT
// ==========================================
const getStudentList = async (req, res) => {
  try {
    const { department, year, section, status, githubLinked, search } = req.query;

    const query = { role: 'student' };

    if (department) query.department = department;
    if (year) query.year = year;
    if (section) query.section = section;
    if (status) query.status = status;
    if (githubLinked !== undefined && githubLinked !== '') {
      query.githubLinked = githubLinked === 'true';
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

    const students = await User.find(query)
      .select('-password')
      .populate('assignedStaff', 'fullName username email department');

    // Attach latest GitHub stats for each student
    const studentIds = students.map(s => s._id);
    const statsList = await GithubStats.find({ user: { $in: studentIds } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    const result = students.map(st => {
      const stObj = st.toObject();
      const stStats = statsMap[st._id.toString()];
      stObj.stats = stStats || {
        totalCommits: 0,
        totalPullRequests: 0,
        totalIssues: 0,
        contributionScore: 0,
        level: 'Bronze',
        syncStatus: st.githubLinked ? 'Connected' : 'Not Connected'
      };
      return stObj;
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students list' });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password').populate('assignedStaff', 'fullName email department');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const stats = await GithubStats.findOne({ user: student._id });

    res.json({
      student,
      stats: stats || {}
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Failed to fetch student details' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { fullName, department, year, section, rollNumber, githubUsername, assignedStaff } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.fullName = fullName || student.fullName;
    student.department = department || student.department;
    student.year = year || student.year;
    student.section = section || student.section;
    student.rollNumber = rollNumber || student.rollNumber;
    
    if (assignedStaff !== undefined) {
      student.assignedStaff = assignedStaff || null;
    }

    if (githubUsername && githubUsername !== student.githubUsername) {
      student.githubUsername = githubUsername;
      student.githubLinked = true;
      githubService.syncUser(student._id, githubUsername);
    }

    await student.save();

    await logAuditAction({
      req,
      action: 'UPDATE_STUDENT',
      target: `Student: ${student.fullName || student.username}`,
      description: `Updated academic/profile details for student ${student.email}`
    });

    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
};

const toggleStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.status = status;
    await student.save();

    await logAuditAction({
      req,
      action: status === 'active' ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
      target: `Student: ${student.fullName || student.username}`,
      description: `Student account status set to ${status}`
    });

    res.json({ message: `Student status updated to ${status}`, status: student.status });
  } catch (error) {
    console.error('Error toggling student status:', error);
    res.status(500).json({ message: 'Failed to update student status' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    await GithubStats.deleteOne({ user: student._id });
    await User.deleteOne({ _id: student._id });

    await logAuditAction({
      req,
      action: 'DELETE_STUDENT',
      target: `Student: ${student.fullName || student.username} (${student.email})`,
      description: 'Permanently deleted student account and GitHub stats'
    });

    res.json({ message: 'Student account deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student account' });
  }
};

const resetStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.password = newPassword;
    student.mustChangePassword = true;
    await student.save();

    await logAuditAction({
      req,
      action: 'RESET_STUDENT_PASSWORD',
      target: `Student: ${student.fullName || student.username}`,
      description: 'Reset password for student'
    });

    res.json({ message: `Password reset successfully for ${student.username}` });
  } catch (error) {
    console.error('Error resetting student password:', error);
    res.status(500).json({ message: 'Failed to reset student password' });
  }
};

// ==========================================
// 4. GITHUB ACCOUNT MANAGEMENT
// ==========================================
const getGithubAccounts = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('fullName username email rollNumber department year section githubUsername githubLinked status');
    const studentIds = students.map(s => s._id);
    
    const statsList = await GithubStats.find({ user: { $in: studentIds } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    const accounts = students.map(st => {
      const stat = statsMap[st._id.toString()];
      return {
        studentId: st._id,
        fullName: st.fullName || st.username,
        rollNumber: st.rollNumber,
        email: st.email,
        department: st.department,
        githubUsername: st.githubUsername || 'Not Connected',
        githubLinked: st.githubLinked,
        connectionStatus: !st.githubLinked ? 'Not Connected' : (stat?.syncStatus || 'Connected'),
        repositoryCount: stat?.totalRepositories || 0,
        totalCommits: stat?.totalCommits || 0,
        lastUpdated: stat?.lastUpdated || null,
        syncErrorMessage: stat?.syncErrorMessage || ''
      };
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching github accounts:', error);
    res.status(500).json({ message: 'Failed to fetch GitHub accounts list' });
  }
};

const syncStudentGithub = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId);

    if (!student || !student.githubUsername || !student.githubLinked) {
      return res.status(400).json({ message: 'Student does not have a linked GitHub account.' });
    }

    // Set status to Syncing
    await GithubStats.updateOne({ user: student._id }, { syncStatus: 'Syncing' });

    const success = await githubService.syncUser(student._id, student.githubUsername);

    if (success) {
      await GithubStats.updateOne({ user: student._id }, { syncStatus: 'Connected', syncErrorMessage: '' });
      await leaderboardService.updateLeaderboards();

      await logAuditAction({
        req,
        action: 'SYNC_GITHUB',
        target: `Student: ${student.fullName || student.username}`,
        description: `Successfully synchronized GitHub data for @${student.githubUsername}`
      });

      res.json({ message: `Successfully synchronized data for @${student.githubUsername}` });
    } else {
      await GithubStats.updateOne({ user: student._id }, { syncStatus: 'Sync Failed', syncErrorMessage: 'GitHub API error or rate limit' });
      res.status(502).json({ message: `Failed to sync GitHub data for @${student.githubUsername}` });
    }
  } catch (error) {
    console.error('Error syncing student github:', error);
    res.status(500).json({ message: 'Failed to sync GitHub data' });
  }
};

const syncAllGithub = async (req, res) => {
  try {
    const linkedStudents = await User.find({ role: 'student', githubLinked: true, githubUsername: { $ne: '' } });

    let successCount = 0;
    let failCount = 0;

    for (const student of linkedStudents) {
      const success = await githubService.syncUser(student._id, student.githubUsername);
      if (success) {
        await GithubStats.updateOne({ user: student._id }, { syncStatus: 'Connected', syncErrorMessage: '' });
        successCount++;
      } else {
        await GithubStats.updateOne({ user: student._id }, { syncStatus: 'Sync Failed' });
        failCount++;
      }
    }

    await leaderboardService.updateLeaderboards();

    await logAuditAction({
      req,
      action: 'SYNC_ALL_GITHUB',
      target: 'All Students',
      description: `Bulk GitHub sync completed: ${successCount} succeeded, ${failCount} failed`
    });

    res.json({ message: `Bulk sync finished. Success: ${successCount}, Failed: ${failCount}` });
  } catch (error) {
    console.error('Error syncing all github accounts:', error);
    res.status(500).json({ message: 'Failed to execute bulk GitHub sync' });
  }
};

const disconnectStudentGithub = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.githubLinked = false;
    student.githubUsername = '';
    await student.save();

    await GithubStats.updateOne({ user: student._id }, { syncStatus: 'Not Connected' });

    await logAuditAction({
      req,
      action: 'DISCONNECT_GITHUB',
      target: `Student: ${student.fullName || student.username}`,
      description: 'Disconnected GitHub account'
    });

    res.json({ message: 'GitHub account unlinked successfully' });
  } catch (error) {
    console.error('Error disconnecting github:', error);
    res.status(500).json({ message: 'Failed to disconnect GitHub account' });
  }
};

// ==========================================
// 5. GITHUB ANALYTICS
// ==========================================
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const statsList = await GithubStats.find().populate('user', 'username fullName department year section status');

    let totalRepos = 0, totalCommits = 0, totalPRs = 0, totalIssues = 0, totalReviews = 0;
    const langMap = {};
    const deptMap = {};

    statsList.forEach(stat => {
      if (!stat.user || stat.user.status === 'deactivated') return;

      totalRepos += stat.totalRepositories || 0;
      totalCommits += stat.totalCommits || 0;
      totalPRs += stat.mergedPullRequests || stat.totalPullRequests || 0;
      totalIssues += stat.totalIssues || 0;
      totalReviews += stat.reviews || 0;

      if (stat.languageUsage) {
        stat.languageUsage.forEach(l => {
          langMap[l.language] = (langMap[l.language] || 0) + (l.count || 1);
        });
      }

      const dept = stat.user.department || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + (stat.totalCommits || 0);
    });

    const languageDistribution = Object.keys(langMap).map(k => ({ language: k, count: langMap[k] }));
    const departmentContributions = Object.keys(deptMap).map(k => ({ department: k, commits: deptMap[k] }));

    res.json({
      totals: {
        repositories: totalRepos,
        commits: totalCommits,
        pullRequests: totalPRs,
        issues: totalIssues,
        reviews: totalReviews
      },
      languageDistribution,
      departmentContributions
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

// ==========================================
// 6. STUDENT RANKINGS
// ==========================================
const getStudentRankings = async (req, res) => {
  try {
    const { department, year, section, sortBy = 'score' } = req.query;

    const query = {};
    if (department) query['user.department'] = department;

    const statsList = await GithubStats.find().populate('user', 'username fullName rollNumber department year section status role');

    let filtered = statsList.filter(s => s.user && s.user.role === 'student' && s.user.status !== 'deactivated');

    if (department) filtered = filtered.filter(s => s.user.department === department);
    if (year) filtered = filtered.filter(s => s.user.year === year);
    if (section) filtered = filtered.filter(s => s.user.section === section);

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'commits') return (b.totalCommits || 0) - (a.totalCommits || 0);
      if (sortBy === 'prs') return (b.mergedPullRequests || 0) - (a.mergedPullRequests || 0);
      if (sortBy === 'issues') return (b.totalIssues || 0) - (a.totalIssues || 0);
      return (b.contributionScore || 0) - (a.contributionScore || 0);
    });

    const rankings = filtered.map((s, idx) => ({
      rank: idx + 1,
      studentId: s.user._id,
      name: s.user.fullName || s.user.username,
      rollNumber: s.user.rollNumber,
      department: s.user.department,
      year: s.user.year,
      section: s.user.section,
      commits: s.totalCommits || 0,
      prs: s.mergedPullRequests || 0,
      issues: s.totalIssues || 0,
      repositories: s.totalRepositories || 0,
      score: s.contributionScore || 0,
      level: s.level || 'Bronze'
    }));

    res.json(rankings);
  } catch (error) {
    console.error('Error fetching student rankings:', error);
    res.status(500).json({ message: 'Failed to fetch student rankings' });
  }
};

// ==========================================
// 7. OPEN SOURCE CONTRIBUTION TRACKING
// ==========================================
const getOpenSourceData = async (req, res) => {
  try {
    const statsList = await GithubStats.find().populate('user', 'username fullName department year githubUsername');

    let totalOpenSourceProjects = 0;
    let externalPRs = 0;
    let mergedPRs = 0;
    let totalIssues = 0;

    const studentBreakdown = [];

    statsList.forEach(stat => {
      if (!stat.user) return;

      const extContributions = stat.externalContributions || [];
      const studentExtPRs = extContributions.filter(c => c.type === 'PR');
      const studentMergedPRs = studentExtPRs.filter(c => c.isMerged);

      externalPRs += studentExtPRs.length;
      mergedPRs += studentMergedPRs.length;
      totalOpenSourceProjects += (stat.repositoriesList || []).filter(r => r.forks > 0).length;

      studentBreakdown.push({
        studentId: stat.user._id,
        name: stat.user.fullName || stat.user.username,
        githubUsername: stat.githubUsername,
        department: stat.user.department,
        personalRepos: stat.totalRepositories || 0,
        externalPRs: studentExtPRs.length,
        mergedPRs: studentMergedPRs.length,
        contributionScore: stat.contributionScore || 0
      });
    });

    res.json({
      totals: {
        openSourceProjects: totalOpenSourceProjects,
        externalPRs,
        mergedPRs,
        totalIssues
      },
      students: studentBreakdown
    });
  } catch (error) {
    console.error('Error fetching open source data:', error);
    res.status(500).json({ message: 'Failed to fetch open source contribution data' });
  }
};

// ==========================================
// 8. ACTIVITY MONITORING
// ==========================================
const getActivityMonitoring = async (req, res) => {
  try {
    const settings = await getSystemSettingsDoc();
    const thresholdDays = settings.inactivityThresholdDays || 14;

    const now = new Date();
    const thresholdDate = new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000);

    const statsList = await GithubStats.find().populate('user', 'username fullName department year rollNumber status');

    const classified = statsList.map(s => {
      if (!s.user) return null;

      const lastUpdated = s.lastUpdated ? new Date(s.lastUpdated) : null;
      const daysInactive = lastUpdated ? Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24)) : 999;

      let activityLevel = 'Inactive';
      if (daysInactive <= 3) activityLevel = 'Highly Active';
      else if (daysInactive <= 7) activityLevel = 'Active';
      else if (daysInactive <= 14) activityLevel = 'Moderately Active';
      else if (daysInactive <= 30) activityLevel = 'Low Activity';

      return {
        studentId: s.user._id,
        name: s.user.fullName || s.user.username,
        rollNumber: s.user.rollNumber,
        department: s.user.department,
        githubUsername: s.githubUsername,
        lastActivity: lastUpdated,
        daysInactive,
        commits: s.totalCommits || 0,
        prs: s.mergedPullRequests || 0,
        issues: s.totalIssues || 0,
        activityLevel,
        isInactive: daysInactive >= thresholdDays
      };
    }).filter(Boolean);

    res.json({
      thresholdDays,
      students: classified
    });
  } catch (error) {
    console.error('Error in activity monitoring:', error);
    res.status(500).json({ message: 'Failed to fetch activity monitoring data' });
  }
};

// ==========================================
// 9. REPORTS GENERATION
// ==========================================
const generateReport = async (req, res) => {
  try {
    const { reportType, department, year, section } = req.query;

    const query = { role: 'student' };
    if (department) query.department = department;
    if (year) query.year = year;
    if (section) query.section = section;

    const students = await User.find(query).select('-password');
    const studentIds = students.map(s => s._id);

    const statsList = await GithubStats.find({ user: { $in: studentIds } });
    const statsMap = {};
    statsList.forEach(s => { statsMap[s.user.toString()] = s; });

    const reportData = students.map(s => {
      const stStats = statsMap[s._id.toString()];
      return {
        studentId: s.rollNumber || s._id,
        name: s.fullName || s.username,
        email: s.email,
        department: s.department,
        year: s.year,
        section: s.section,
        githubUsername: s.githubUsername || 'N/A',
        commits: stStats?.totalCommits || 0,
        prs: stStats?.mergedPullRequests || 0,
        issues: stStats?.totalIssues || 0,
        repositories: stStats?.totalRepositories || 0,
        score: stStats?.contributionScore || 0,
        level: stStats?.level || 'Bronze',
        lastUpdated: stStats?.lastUpdated ? new Date(stStats.lastUpdated).toLocaleDateString() : 'Never'
      };
    });

    await logAuditAction({
      req,
      action: 'GENERATE_REPORT',
      target: `Report: ${reportType || 'General Activity'}`,
      description: `Generated report containing ${reportData.length} records`
    });

    res.json({
      reportType: reportType || 'Student GitHub Activity Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

// ==========================================
// 10. AUDIT LOGS
// ==========================================
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

// ==========================================
// 11. ADMIN SETTINGS
// ==========================================
const getSettings = async (req, res) => {
  try {
    const settings = await getSystemSettingsDoc();
    const adminUser = await User.findById(req.user._id).select('-password');

    res.json({
      adminProfile: adminUser,
      settings,
      githubConfigStatus: {
        hasToken: !!process.env.GITHUB_TOKEN,
        hasClientId: !!process.env.GITHUB_CLIENT_ID
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch admin settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { commitPoints, prPoints, mergedPrPoints, issuePoints, reviewPoints, inactivityThresholdDays, fullName, email } = req.body;

    const settings = await getSystemSettingsDoc();
    if (commitPoints !== undefined) settings.commitPoints = commitPoints;
    if (prPoints !== undefined) settings.prPoints = prPoints;
    if (mergedPrPoints !== undefined) settings.mergedPrPoints = mergedPrPoints;
    if (issuePoints !== undefined) settings.issuePoints = issuePoints;
    if (reviewPoints !== undefined) settings.reviewPoints = reviewPoints;
    if (inactivityThresholdDays !== undefined) settings.inactivityThresholdDays = inactivityThresholdDays;
    settings.updatedAt = new Date();
    await settings.save();

    const admin = await User.findById(req.user._id);
    if (fullName) admin.fullName = fullName;
    if (email) admin.email = email;
    await admin.save();

    await logAuditAction({
      req,
      action: 'UPDATE_SETTINGS',
      target: 'System Settings',
      description: 'Updated scoring rules and inactivity thresholds'
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

// ==========================================
// 12. NOTIFICATIONS & GLOBAL SEARCH
// ==========================================
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.json({ students: [], staff: [], github: [] });

    const regex = new RegExp(q.trim(), 'i');

    const students = await User.find({ role: 'student', $or: [{ username: regex }, { fullName: regex }, { email: regex }, { rollNumber: regex }] }).select('fullName username email rollNumber department year');
    const staff = await User.find({ role: 'teacher', $or: [{ username: regex }, { fullName: regex }, { email: regex }, { rollNumber: regex }] }).select('fullName username email department');
    const githubStats = await GithubStats.find({ githubUsername: regex }).populate('user', 'fullName username email');

    res.json({
      students,
      staff,
      github: githubStats.map(g => ({
        githubUsername: g.githubUsername,
        studentName: g.user?.fullName || g.user?.username,
        score: g.contributionScore
      }))
    });
  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({ message: 'Failed to execute global search' });
  }
};

module.exports = {
  getDashboardOverview,
  getStaffList,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
  resetStaffPassword,
  assignStudentsToStaff,
  getStudentList,
  getStudentDetails,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
  resetStudentPassword,
  getGithubAccounts,
  syncStudentGithub,
  syncAllGithub,
  disconnectStudentGithub,
  getAnalytics,
  getStudentRankings,
  getOpenSourceData,
  getActivityMonitoring,
  generateReport,
  getAuditLogs,
  getSettings,
  updateSettings,
  getNotifications,
  globalSearch
};
