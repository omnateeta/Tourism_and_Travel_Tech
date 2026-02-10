const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get notification preferences
router.get('/preferences', protect, notificationController.getPreferences);

// Update notification preferences
router.put('/preferences', protect, notificationController.updatePreferences);

// Get notification history
router.get('/history', protect, notificationController.getNotificationHistory);

// Send test notification
router.post('/test', protect, notificationController.testNotification);

module.exports = router;
