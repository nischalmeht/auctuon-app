const express = require('express');
const userController = require('../controllers/userController.js');
const authenticateUser = require('../middlewares/authenication.js');

const router = express.Router();

// Define routes for user-related operations
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/user', authenticateUser, userController.getUser);
router.get('/leaderboard', userController.fetchLeaderBoard);
router.get('/logout', authenticateUser.isAuthenticated, userController.logout);

module.exports = router;
