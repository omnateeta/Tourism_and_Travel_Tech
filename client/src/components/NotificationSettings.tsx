import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Phone, Mail, Clock, Calendar, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { notificationsAPI } from '../services/api';

interface NotificationPreferences {
  enabled: boolean;
  reminders: {
    dayBefore: boolean;
    morningOf: boolean;
    hourBefore: boolean;
  };
  notificationMethods: {
    sms: boolean;
    email: boolean;
  };
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    reminders: {
      dayBefore: true,
      morningOf: true,
      hourBefore: true
    },
    notificationMethods: {
      sms: true,
      email: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await notificationsAPI.getPreferences();
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationsAPI.updatePreferences(preferences);
      setTestResult({
        success: true,
        message: 'Notification settings saved successfully!'
      });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to save settings'
      });
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const response = await notificationsAPI.testNotification();
      setTestResult({
        success: true,
        message: `Test notification sent to ${response.data.phoneNumber}! Check your phone.`
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send test notification'
      });
    } finally {
      setTestSending(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Trip Notifications</h3>
          <p className="text-sm text-gray-500">Get reminders for your travel plans</p>
        </div>
      </div>

      {/* Enable Toggle */}
      <div className="mb-8">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-medium text-gray-900">Enable Notifications</h4>
            <p className="text-sm text-gray-500 mt-1">
              Receive SMS reminders for your scheduled activities
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => setPreferences({
                ...preferences,
                enabled: e.target.checked
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
      </div>

      {preferences.enabled && (
        <>
          {/* Reminder Types */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Reminder Types
            </h4>
            <div className="space-y-3">
              {[
                { 
                  key: 'dayBefore', 
                  label: 'Day Before', 
                  icon: Calendar,
                  desc: 'Get a reminder the day before each activity'
                },
                { 
                  key: 'morningOf', 
                  label: 'Morning Of', 
                  icon: Clock,
                  desc: 'Morning reminder on the day of the activity'
                },
                { 
                  key: 'hourBefore', 
                  label: '1 Hour Before', 
                  icon: AlertCircle,
                  desc: 'Final reminder 1 hour before the activity'
                }
              ].map((reminder) => {
                const Icon = reminder.icon;
                return (
                  <div key={reminder.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{reminder.label}</p>
                        <p className="text-sm text-gray-500">{reminder.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.reminders[reminder.key as keyof typeof preferences.reminders]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          reminders: {
                            ...preferences.reminders,
                            [reminder.key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notification Methods */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              Notification Methods
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">SMS</p>
                    <p className="text-sm text-gray-500">Text messages to your phone</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notificationMethods.sms}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notificationMethods: {
                        ...preferences.notificationMethods,
                        sms: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">Coming soon</p>
                  </div>
                </div>
                <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="mb-6">
            <button
              onClick={handleTest}
              disabled={testSending || !preferences.notificationMethods.sms}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Test...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Test Notification
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Make sure your phone number is correct in profile
            </p>
          </div>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Save Notification Settings
          </>
        )}
      </button>

      {/* Test Result */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            testResult.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {testResult.success ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{testResult.message}</span>
        </motion.div>
      )}

      {/* Info */}
      {!preferences.enabled && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Notifications are disabled</p>
              <p className="text-sm text-blue-600 mt-1">
                Enable notifications to receive SMS reminders for your travel plans
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationSettings;
