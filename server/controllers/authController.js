const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, profileCompleted) => {
  return jwt.sign({ id, role, profileCompleted }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    let { username, rollNumber, email, phoneNumber, department, year, password, confirmPassword } = req.body;

    username = (username || '').trim();
    rollNumber = (rollNumber || '').trim().toUpperCase();
    email = (email || '').trim().toLowerCase();
    let cleanPhone = (phoneNumber || '').toString().trim().replace(/\D/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    }

    // Validate Input Fields
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });
    }
    if (!department) return res.status(400).json({ message: 'Department is required.' });
    if (!year) return res.status(400).json({ message: 'Year is required.' });
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Phone validation
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    if (!rollNumber) {
      return res.status(400).json({ message: 'Roll Number is required.' });
    }

    // Check Unique Constraints
    const rollNumberExists = await User.findOne({ rollNumber });
    if (rollNumberExists) {
      return res.status(400).json({ message: `Roll Number '${rollNumber}' is already registered.` });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: `Email '${email}' is already registered.` });
    }

    // Create User (defaults role='student', profileCompleted=false)
    const user = await User.create({
      username,
      fullName: username,
      rollNumber,
      email,
      phoneNumber: cleanPhone,
      department,
      year,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName || user.username,
        department: user.department,
        role: user.role,
        dbRole: user.role,
        profileCompleted: user.profileCompleted,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id, user.role, user.profileCompleted),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error during registration' });
  }
};

// @desc    Authenticate User
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email/roll number and password.' });
    }

    const cleanInput = email.trim();
    const normalizedEmail = cleanInput.toLowerCase();
    const upperRoll = cleanInput.toUpperCase();

    // Find by email, roll number, or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { rollNumber: upperRoll },
        { username: new RegExp(`^${cleanInput}$`, 'i') }
      ]
    });

    if (user && (await user.matchPassword(password))) {
      // Verify account status
      if (user.status === 'deactivated' || user.status === 'inactive') {
        return res.status(403).json({ message: 'Your account is currently inactive or deactivated. Please contact the administrator.' });
      }

      user.lastLogin = new Date();
      await user.save();

      const normalizedRole = user.role === 'teacher' ? 'staff' : user.role;

      res.json({
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName || user.username,
        department: user.department,
        role: normalizedRole,
        dbRole: user.role,
        profileCompleted: user.profileCompleted,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id, user.role, user.profileCompleted),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
