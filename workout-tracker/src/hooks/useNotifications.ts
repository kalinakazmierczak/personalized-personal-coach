import { useEffect, useCallback, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutLog } from '../types';
import { calculateStreak, daysSinceLastWorkout } from '../utils/helpers';
import {
  scheduleDailyReminder,
  cancelAllNotifications,
  requestNotificationPermissions,
  scheduleStreakNotification,
  scheduleCelebrationNotification,
  scheduleMissedWorkoutNotification,
} from '../services/notifications';

const SNOOZE_KEY = 'notification_snoozed_until';
const PREFS_KEY = 'notification_prefs';

export interface NotificationPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
  streakAlerts: boolean;
  missedReminders: boolean;
  celebrations: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  hour: 8,
  minute: 0,
  streakAlerts: true,
  missedReminders: true,
  celebrations: true,
};

export const useNotifications = (workoutLogs: WorkoutLog[]) => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [snoozedUntil, setSnoozedUntil] = useState<number | null>(null);
  const hasInitialized = useRef(false);

  // Load prefs on mount
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(PREFS_KEY);
        if (stored) setPrefs(JSON.parse(stored));
        const snooze = await AsyncStorage.getItem(SNOOZE_KEY);
        if (snooze) {
          const until = parseInt(snooze, 10);
          if (until > Date.now()) {
            setSnoozedUntil(until);
          } else {
            await AsyncStorage.removeItem(SNOOZE_KEY);
          }
        }
      } catch {}
      hasInitialized.current = true;
    };
    load();
  }, []);

  // Schedule notifications whenever prefs or workout data change
  useEffect(() => {
    if (!hasInitialized.current) return;
    scheduleAllNotifications();
  }, [prefs, workoutLogs.length]);

  const scheduleAllNotifications = useCallback(async () => {
    await cancelAllNotifications();

    if (!prefs.enabled) return;

    // Check if snoozed
    if (snoozedUntil && Date.now() < snoozedUntil) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    // Daily reminder
    await scheduleDailyReminder(prefs.hour, prefs.minute);

    const streak = calculateStreak(workoutLogs);
    const daysSince = daysSinceLastWorkout(workoutLogs);

    // Streak milestone notifications
    if (prefs.streakAlerts && streak > 0 && [3, 7, 14, 30, 50, 100].includes(streak)) {
      await scheduleStreakNotification(streak);
    }

    // Celebration for first workout or big volume day
    if (prefs.celebrations && workoutLogs.length === 1) {
      await scheduleCelebrationNotification('first');
    }

    // Missed workout reminder
    if (prefs.missedReminders && daysSince !== null && daysSince >= 2) {
      await scheduleMissedWorkoutNotification(daysSince);
    }
  }, [prefs, workoutLogs, snoozedUntil]);

  const updatePrefs = useCallback(async (update: Partial<NotificationPrefs>) => {
    const newPrefs = { ...prefs, ...update };
    setPrefs(newPrefs);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
  }, [prefs]);

  const snooze = useCallback(async (hours: number = 4) => {
    const until = Date.now() + hours * 60 * 60 * 1000;
    setSnoozedUntil(until);
    await AsyncStorage.setItem(SNOOZE_KEY, until.toString());
    await cancelAllNotifications();
  }, []);

  const unsnooze = useCallback(async () => {
    setSnoozedUntil(null);
    await AsyncStorage.removeItem(SNOOZE_KEY);
    await scheduleAllNotifications();
  }, [scheduleAllNotifications]);

  const isSnoozed = snoozedUntil !== null && Date.now() < snoozedUntil;

  return {
    prefs,
    updatePrefs,
    snooze,
    unsnooze,
    isSnoozed,
    scheduleAllNotifications,
  };
};
