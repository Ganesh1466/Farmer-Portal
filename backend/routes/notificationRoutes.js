const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, createNotification } = require('../controllers/notificationController');

// Get notifications for a user
router.get('/:userId', getNotifications);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Create a notification
router.post('/', createNotification);

module.exports = router;
