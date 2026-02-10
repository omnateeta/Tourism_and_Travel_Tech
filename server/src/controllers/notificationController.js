const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { enabled, reminders, notificationMethods } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          notificationPreferences: {
            enabled: enabled ?? false,
            reminders: {
              dayBefore: reminders?.dayBefore ?? true,
              morningOf: reminders?.morningOf ?? true,
              hourBefore: reminders?.hourBefore ?? true
            },
            notificationMethods: {
              sms: notificationMethods?.sms ?? true,
              email: notificationMethods?.email ?? false
            }
          }
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message 
    });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      preferences: user.notificationPreferences || {
        enabled: false,
        reminders: { dayBefore: true, morningOf: true, hourBefore: true },
        notificationMethods: { sms: true, email: false }
      }
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message 
    });
  }
};

// Get user's notification history
exports.getNotificationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 50;

    const notifications = await notificationService.getUserNotifications(userId, limit);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error getting notification history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get notification history',
      error: error.message 
    });
  }
};

// Test notification (send immediate test)
exports.testNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please add a phone number to your profile first'
      });
    }

    // Create a test notification
    const testNotification = new Notification({
      userId: user._id,
      activityId: 'test',
      type: 'custom',
      scheduledTime: new Date(),
      message: `Test notification from Smart Travel Assistant! Your notifications are working correctly. You'll receive reminders at: ${user.phoneNumber}`
    });

    await notificationService.sendNotification(testNotification);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      phoneNumber: user.phoneNumber
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send test notification',
      error: error.message 
    });
  }
};
