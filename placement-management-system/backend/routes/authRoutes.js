const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllUsers, deleteUser, getPendingCompanies, approveCompany, revokeCompany } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Admin Routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/pending-companies', protect, authorize('admin'), getPendingCompanies);
router.put('/approve-company/:id', protect, authorize('admin'), approveCompany);
router.put('/revoke-company/:id', protect, authorize('admin'), revokeCompany);

module.exports = router;
