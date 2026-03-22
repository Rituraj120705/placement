const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, major, graduationYear, companyName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object based on role
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      isApproved: role === 'company' ? false : true,
    };

    if (role === 'student') {
      userData.major = major;
      userData.graduationYear = graduationYear;
    } else if (role === 'company') {
      userData.companyName = companyName;
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check for company approval
      if (user.role === 'company' && !user.isApproved) {
        return res.status(403).json({ message: 'Your company account is pending approval by an admin.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending companies (Admin only)
// @route   GET /api/auth/pending-companies
// @access  Private (Admin)
const getPendingCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'company', isApproved: false }).select('-password');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a company (Admin only)
// @route   PUT /api/auth/approve-company/:id
// @access  Private (Admin)
const approveCompany = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    user.isApproved = true;
    await user.save();
    
    res.json({ message: 'Company approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke/Block a company (Admin only)
// @route   PUT /api/auth/revoke-company/:id
// @access  Private (Admin)
const revokeCompany = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    user.isApproved = false;
    await user.save();
    
    res.json({ message: 'Company access revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, getAllUsers, deleteUser, getPendingCompanies, approveCompany, revokeCompany };
