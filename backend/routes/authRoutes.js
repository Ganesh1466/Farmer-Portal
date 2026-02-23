const express = require('express');
const router = express.Router();
const { deleteAccount } = require('../controllers/authController');

// Route to delete account
// POST /api/auth/delete
router.post('/delete', deleteAccount);

module.exports = router;
