const express = require('express');
const userController = require('../controllers/userController.js');
const router = express.Router();
// Define routes for user-related operations
router.get('/', userController.registerUser); // Get all users


module.exports = router;