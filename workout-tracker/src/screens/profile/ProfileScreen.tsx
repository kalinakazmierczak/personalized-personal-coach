import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../../hooks/useAuth';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useNotifications, NotificationPrefs } from '../../hooks/useNotifications';
import { generateWorkoutPlan } from '../../services/aiChat';
import { COLORS, SPACING, FONT_SIZES, REST_TIMER_OPTIONS, STREAK_MESSAGES } from '../../constants';
import { calculateStreak, daysSinceLastWorkout, formatTimer } from '../../utils/helpers';
import AIChatBubble from '../../components/AIChatBubble';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { workoutLogs } = useWorkouts();
  const { prefs, updatePrefs, snooze, unsnooze, isSnoozed } = useNotifications(workoutLogs);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const [restDefault, setRestDefault] = useState(90);

  const streak = useMemo(() => calculateStreak(workoutLogs), [workoutLogs]);
  const daysSince = useMemo(() => daysSinceLastWorkout(workoutLogs), [workoutLogs]);

  const streakMessage = useMemo(() => {
    if (streak === 0) return STREAK_MESSAGES.zero;
    if (streak < 5) return STREAK_MESSAGES.low(streak);
    if (streak < 14) return STREAK_MESSAGES.mid(streak);
    return STREAK_MESSAGES.high(streak);
  }, [streak]);

  const handleGeneratePlan = () => {
    const plan = generateWorkoutPlan([
      {
        id: '1',
        user_id: user?.id || '',
        goal_type: 'strength',
        target_description: 'Get stronger',
        target_value: null,
        target_date: null,
        current_progress: 0,
        priority: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]);
    setWorkoutPlan(plan);
  };

  const handleLogout = () => {
    Alert.alert('log out', 'are you sure?', [
      { text: 'cancel', style: 'cancel' },
      { text: 'log out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSnooze = () => {
    Alert.alert('snooze notifications', 'silence for how long?', [
      { text: 'cancel', style: 'cancel' },
      { text: '4 hours', onPress: () => snooze(4) },
      { text: '8 hours', onPress: () => snooze(8) },
      { text: '24 hours', onPress: () => snooze(24) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Info */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toLowerCase() || '?'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email || 'not logged in'}</Text>
        </View>

        {/* Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{streak}</Text>
              <Text style={styles.streakLabel}>streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{workoutLogs.length}</Text>
              <Text style={styles.streakLabel}>total</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>
                {daysSince !== null ? daysSince : '-'}
              </Text>
              <Text style={styles.streakLabel}>days ago</Text>
            </View>
          </View>
          <Text style={styles.streakMessage}>{streakMessage}</Text>
        </View>

        <View style={styles.divider} />

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>notifications</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingTitle}>daily reminders</Text>
            <Switch
              value={prefs.enabled}
              onValueChange={(v) => updatePrefs({ enabled: v })}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.text}
            />
          </View>

          {prefs.enabled && (
            <>
              <View style={styles.settingRow}>
                <Text style={styles.settingTitle}>streak alerts</Text>
                <Switch
                  value={prefs.streakAlerts}
                  onValueChange={(v) => updatePrefs({ streakAlerts: v })}
                  trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  thumbColor={COLORS.text}
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingTitle}>missed workout reminders</Text>
                <Switch
                  value={prefs.missedReminders}
                  onValueChange={(v) => updatePrefs({ missedReminders: v })}
                  trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  thumbColor={COLORS.text}
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingTitle}>celebrations</Text>
                <Switch
                  value={prefs.celebrations}
                  onValueChange={(v) => updatePrefs({ celebrations: v })}
                  trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  thumbColor={COLORS.text}
                />
              </View>

              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingTitle}>
                    {isSnoozed ? 'notifications snoozed' : 'snooze'}
                  </Text>
                  <Text style={styles.settingSubtitle}>
                    {isSnoozed ? 'tap to unsnooze' : 'temporarily silence'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={isSnoozed ? unsnooze : handleSnooze}
                >
                  <Ionicons
                    name={isSnoozed ? 'notifications-off' : 'notifications-outline'}
                    size={18}
                    color={isSnoozed ? COLORS.warning : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.divider} />

        {/* Rest Timer Defaults */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>rest timer default</Text>
          <View style={styles.timerPresetsRow}>
            {REST_TIMER_OPTIONS.map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.timerPreset,
                  restDefault === sec && styles.timerPresetActive,
                ]}
                onPress={() => setRestDefault(sec)}
              >
                <Text
                  style={[
                    styles.timerPresetText,
                    restDefault === sec && styles.timerPresetTextActive,
                  ]}
                >
                  {formatTimer(sec)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* AI Workout Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>workout plan</Text>
          <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan}>
            <Text style={styles.generateButtonText}>generate</Text>
          </TouchableOpacity>
          {workoutPlan && (
            <View style={styles.planContainer}>
              <AIChatBubble message={workoutPlan} isUser={false} />
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
    gap: SPACING.lg,
  },
  card: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '200',
  },
  email: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '300',
    letterSpacing: 0.5,
  },

  // Streak card
  streakCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '200',
    color: COLORS.accent,
  },
  streakLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  streakDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: COLORS.border,
  },
  streakMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 18,
  },

  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
  },

  // Section
  section: {
    paddingVertical: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
    fontWeight: '300',
  },
  snoozeButton: {
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Timer presets
  timerPresetsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timerPreset: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  timerPresetActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  timerPresetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
  },
  timerPresetTextActive: {
    color: COLORS.background,
    fontWeight: '500',
  },

  // AI Plan
  generateButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
  },
  generateButtonText: {
    color: COLORS.text,
    fontWeight: '400',
    fontSize: FONT_SIZES.sm,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  planContainer: {
    marginTop: SPACING.lg,
  },

  // Logout
  logoutButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default ProfileScreen;