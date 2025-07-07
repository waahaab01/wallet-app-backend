const express = require('express');
const { getAllUsers, getSingleUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get('/', protect, adminMiddleware, getAllUsers);
// GET /api/users/:id - Get single user by ID (admin only)
router.get('/:id', protect, adminMiddleware, getSingleUser);

module.exports = router;
