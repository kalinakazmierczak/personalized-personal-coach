import React, { useState, useEffect } from 'react';
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
import useAuth from '../../hooks/useAuth';
import { scheduleDailyReminder, cancelAllNotifications, requestNotificationPermissions } from '../../services/notifications';
import { generateWorkoutPlan } from '../../services/aiChat';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import AIChatBubble from '../../components/AIChatBubble';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);

  const handleToggleReminders = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyReminder(8, 0);
        setRemindersEnabled(true);
      } else {
        Alert.alert('Permission Required', 'Please allow notifications in Settings.');
      }
    } else {
      await cancelAllNotifications();
      setRemindersEnabled(false);
    }
  };

  const handleGeneratePlan = () => {
    // Example goals — in production you'd fetch these from Supabase
    const plan = generateWorkoutPlan([
      {
        id: '1',
        user_id: user?.id || '',
        goal_type: 'strength',
        target_description: 'Get stronger',
        target_value: null,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]);
    setWorkoutPlan(plan);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Info */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email || 'Not logged in'}</Text>
        </View>

        {/* Reminders */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Daily Reminders</Text>
              <Text style={styles.settingSubtitle}>Get notified at 8:00 AM</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={handleToggleReminders}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={remindersEnabled ? COLORS.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* AI Workout Plan */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🤖 AI Workout Plan</Text>
          <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan}>
            <Text style={styles.generateButtonText}>Generate Plan</Text>
          </TouchableOpacity>
          {workoutPlan && (
            <View style={styles.planContainer}>
              <AIChatBubble message={workoutPlan} isUser={false} />
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
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
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
  },
  email: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  settingTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  generateButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  planContainer: {
    marginTop: SPACING.md,
    width: '100%',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});

export default ProfileScreen;