const Notification = require('../models/Notification');
const User = require('../models/User');

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (accountSid && authToken && twilioPhoneNumber) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio SMS service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error.message);
    twilioClient = null;
  }
} else {
  console.log('Twilio credentials not found, using console logging for notifications');
  console.log('Account SID:', accountSid ? 'SET' : 'MISSING');
  console.log('Auth Token:', authToken ? 'SET' : 'MISSING');
  console.log('Phone Number:', twilioPhoneNumber ? 'SET' : 'MISSING');
}

class NotificationService {
  constructor() {
    // For demo purposes, we'll log notifications instead of sending real SMS
    // In production, integrate with Twilio, AWS SNS, or other SMS service
    this.isProcessing = false;
  }

  // Schedule notifications for an itinerary
  async scheduleItineraryNotifications(itinerary, userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.notificationPreferences?.enabled) {
        console.log('Notifications disabled for user:', userId);
        return;
      }

      const notifications = [];
      const prefs = user.notificationPreferences;

      // Process each day and activity
      for (const day of itinerary.days) {
        const dayDate = new Date(day.date);
        
        for (const activity of day.activities) {
          const activityTime = this.parseTimeSlot(activity.timeSlot, dayDate);
          
          // Day before reminder
          if (prefs.reminders?.dayBefore) {
            const dayBeforeTime = new Date(activityTime);
            dayBeforeTime.setDate(dayBeforeTime.getDate() - 1);
            dayBeforeTime.setHours(18, 0, 0, 0); // 6 PM day before
            
            notifications.push({
              userId,
              itineraryId: itinerary._id,
              activityId: `${day.day}-${activity.name}`,
              type: 'day-before',
              scheduledTime: dayBeforeTime,
              message: `Reminder: Tomorrow at ${activity.timeSlot} - ${activity.name} in ${itinerary.destination.name}. Get ready for your adventure!`
            });
          }

          // Morning of reminder
          if (prefs.reminders?.morningOf) {
            const morningTime = new Date(dayDate);
            morningTime.setHours(8, 0, 0, 0); // 8 AM on the day
            
            notifications.push({
              userId,
              itineraryId: itinerary._id,
              activityId: `${day.day}-${activity.name}`,
              type: 'morning-of',
              scheduledTime: morningTime,
              message: `Good morning! Today at ${activity.timeSlot}: ${activity.name}. Have a wonderful time in ${itinerary.destination.name}!`
            });
          }

          // Hour before reminder
          if (prefs.reminders?.hourBefore) {
            const hourBeforeTime = new Date(activityTime);
            hourBeforeTime.setHours(hourBeforeTime.getHours() - 1);
            
            notifications.push({
              userId,
              itineraryId: itinerary._id,
              activityId: `${day.day}-${activity.name}`,
              type: 'hour-before',
              scheduledTime: hourBeforeTime,
              message: `Up next in 1 hour: ${activity.name} at ${activity.timeSlot}. Location: ${activity.location?.address || itinerary.destination.name}`
            });
          }
        }
      }

      // Save all notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Scheduled ${notifications.length} notifications for user ${userId}`);
      }

      return notifications;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      throw error;
    }
  }

  // Parse time slot string to get actual time
  parseTimeSlot(timeSlot, baseDate) {
    const date = new Date(baseDate);
    
    // Check if timeSlot is valid before processing
    if (!timeSlot || typeof timeSlot !== 'string') {
      // Return the base date with default time (12:00 PM)
      date.setHours(12, 0, 0, 0);
      return date;
    }
    
    // Handle common time formats
    const timeMatch = timeSlot.match(/(\d+):?(\d*)?\s*(AM|PM|am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3]?.toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      date.setHours(hours, minutes, 0, 0);
    }
    
    return date;
  }

  // Process pending notifications (to be called by a cron job)
  async processPendingNotifications() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      const pendingNotifications = await Notification.find({
        status: 'pending',
        scheduledTime: { $lte: now }
      }).populate('userId');

      console.log(`Processing ${pendingNotifications.length} pending notifications`);

      for (const notification of pendingNotifications) {
        await this.sendNotification(notification);
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Send a single notification
  async sendNotification(notification) {
    try {
      // Fetch user data explicitly instead of relying on population
      const User = require('../models/User');
      const user = await User.findById(notification.userId);
      
      // Debug logging
      console.log('=== NOTIFICATION DEBUG ===');
      console.log('Notification ID:', notification._id);
      console.log('User ID from notification:', notification.userId);
      console.log('Fetched user ID:', user?._id);
      console.log('Phone number field:', user?.phoneNumber);
      console.log('Phone number type:', typeof user?.phoneNumber);
      console.log('Phone number truthy:', !!user?.phoneNumber);
      
      if (!user || !user.phoneNumber) {
        console.log(`No phone number for user ${user?._id || notification.userId || 'unknown'}, skipping notification`);
        notification.status = 'failed';
        notification.errorMessage = 'No phone number provided';
        await notification.save();
        return;
      }

      // Format phone number to E.164 format (+91XXXXXXXXXX)
      let formattedPhone = user.phoneNumber.trim().replace(/\s+/g, ''); // Remove all spaces
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+91' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }

      if (twilioClient) {
        // Send real SMS via Twilio
        try {
          await twilioClient.messages.create({
            body: notification.message,
            from: twilioPhoneNumber,
            to: formattedPhone
          });
          
          console.log('========================================');
          console.log('📱 REAL SMS SENT VIA TWILIO');
          console.log('To:', formattedPhone);
          console.log('Message:', notification.message);
          console.log('========================================');
          
          notification.status = 'sent';
          notification.sentAt = new Date();
          await notification.save();
        } catch (twilioError) {
          console.error('Twilio SMS failed:', twilioError.message);
          notification.status = 'failed';
          notification.errorMessage = twilioError.message;
          await notification.save();
        }
      } else {
        // Fallback to console logging
        console.log('========================================');
        console.log('📱 SMS NOTIFICATION (DEMO)');
        console.log('To:', formattedPhone);
        console.log('Message:', notification.message);
        console.log('Type:', notification.type);
        console.log('========================================');
        
        // Simulate SMS sending success
        notification.status = 'sent';
        notification.sentAt = new Date();
        await notification.save();
      }

    } catch (error) {
      console.error('Error sending notification:', error);
      notification.status = 'failed';
      notification.errorMessage = error.message;
      await notification.save();
    }
  }

  // Cancel notifications for an itinerary
  async cancelItineraryNotifications(itineraryId, userId) {
    try {
      const result = await Notification.updateMany(
        { 
          itineraryId,
          userId,
          status: 'pending'
        },
        { 
          status: 'cancelled' 
        }
      );
      
      console.log(`Cancelled ${result.modifiedCount} notifications for itinerary ${itineraryId}`);
      return result;
    } catch (error) {
      console.error('Error cancelling notifications:', error);
      throw error;
    }
  }

  // Get user's notification history
  async getUserNotifications(userId, limit = 50) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new NotificationService();
