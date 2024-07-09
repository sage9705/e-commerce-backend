const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, verifyEmail } = require('../controllers/UserController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getUserProfile);
router.get('/verify/:token', verifyEmail);

module.exports = router;