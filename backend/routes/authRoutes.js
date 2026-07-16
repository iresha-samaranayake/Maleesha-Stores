const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  validateToken,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites
} = require('../controllers/authController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);
router.get('/users', authenticateUser, authorizeRoles('admin'), getUsers);
router.get('/validate', authenticateUser, validateToken);

router.get('/favorites', authenticateUser, getUserFavorites);
router.post('/favorites', authenticateUser, addToFavorites);
router.delete('/favorites/:productId', authenticateUser, removeFromFavorites);

module.exports = router;

