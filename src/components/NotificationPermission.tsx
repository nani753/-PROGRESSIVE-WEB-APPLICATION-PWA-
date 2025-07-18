import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { notificationManager } from '../utils/notifications';

export const NotificationPermission: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(
    'Notification' in window && Notification.permission === 'default'
  );

  const handleEnableNotifications = async () => {
    const granted = await notificationManager.requestPermission();
    
    if (granted) {
      await notificationManager.subscribeToPush();
      await notificationManager.sendNotification('Notifications Enabled!', {
        body: 'You\'ll now receive updates about your orders and special offers.',
        icon: '/icon-192x192.png'
      });
    }
    
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-w-sm mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Enable Notifications</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Get notified about order updates, special offers, and new products
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleEnableNotifications}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};