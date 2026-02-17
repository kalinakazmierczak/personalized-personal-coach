import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE, TIMER_CHANNEL_ID, NOTIFICATION_CHANNEL_ID } from '../constants';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission for notifications not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Workout Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync(TIMER_CHANNEL_ID, {
      name: 'Rest Timer',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
    });
  }

  return true;
};

export const scheduleDailyReminder = async (
  hour: number = DEFAULT_REMINDER_HOUR,
  minute: number = DEFAULT_REMINDER_MINUTE
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'time to train',
      body: "your workout is waiting. let's go.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

export const scheduleStreakNotification = async (streak: number) => {
  const messages: Record<number, string> = {
    3: `3 day streak. the habit is forming.`,
    7: `7 days straight. you're building something.`,
    14: `two weeks locked in. respect.`,
    30: `30 day streak. that's elite consistency.`,
    50: `50 days. you're not the same person who started.`,
    100: `100 days. absolute legend status.`,
  };

  const body = messages[streak] || `${streak} day streak. keep going.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'streak update',
      body,
      sound: true,
    },
    trigger: null, // Immediate
  });
};

export const scheduleCelebrationNotification = async (type: 'first' | 'pr' | 'weekly') => {
  const messages = {
    first: "first workout logged. this is where it starts.",
    pr: "new personal record. the work is paying off.",
    weekly: "solid week of training. keep the momentum.",
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'nice work',
      body: messages[type],
      sound: true,
    },
    trigger: null,
  });
};

export const scheduleMissedWorkoutNotification = async (daysMissed: number) => {
  const messages = [
    "it's been a couple days. your muscles are waiting.",
    "3 days off. time to get back to it.",
    "rest is good, but don't lose momentum.",
    "your streak reset. today's a fresh start.",
  ];

  const idx = Math.min(daysMissed - 2, messages.length - 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'missing you',
      body: messages[idx],
      sound: true,
    },
    trigger: null,
  });
};

export const scheduleRestTimerNotification = async (seconds: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'rest over',
      body: 'time for your next set.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};