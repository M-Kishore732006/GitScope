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
    const { username, rollNumber, email, phoneNumber, department, year, password, confirmPassword } = req.body;

    // Validate Input Fields mapping to exactly how prompt wants
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });
    }
    if (!department) return res.status(400).json({ message: 'Department is required.' });
    if (!year) return res.status(400).json({ message: 'Year is required.' });
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    
    // Email regex validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    // Check Unique Constraints
    const rollNumberExists = await User.findOne({ rollNumber });
    if (rollNumberExists) {
      return res.status(400).json({ message: 'Roll Number already exists.' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Create User (defaults role='student', profileCompleted=false)
    const user = await User.create({
      username,
      rollNumber,
      email,
      phoneNumber,
      department,
      year,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role, user.profileCompleted),
        mustChangePassword: user.mustChangePassword
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc    Authenticate User
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id, user.role, user.profileCompleted),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
