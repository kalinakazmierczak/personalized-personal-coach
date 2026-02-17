import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useCoach } from '../../hooks/useCoach';
import { ChatMessage, CoachingStyle, UserGoal } from '../../types';
import { COLORS, SPACING, FONT_SIZES, QUICK_ACTIONS, GOAL_TYPES } from '../../constants';
import { formatDateShort } from '../../utils/helpers';

const CoachScreen = () => {
  const { workoutLogs, fetchWorkoutLogs } = useWorkouts();
  const coach = useCoach(workoutLogs);
  const [input, setInput] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutLogs();
      coach.refreshData();
    }, [])
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (coach.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [coach.messages.length]);

  const handleSend = () => {
    if (!input.trim() || coach.sending) return;
    coach.sendMessage(input.trim());
    setInput('');
  };

  const handleQuickAction = (prompt: string) => {
    coach.sendMessage(prompt);
  };

  const handleClearHistory = () => {
    Alert.alert('clear chat', 'this will delete all messages. are you sure?', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'clear',
        style: 'destructive',
        onPress: () => coach.clearHistory(),
      },
    ]);
  };

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === 'user';
      return (
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          {!isUser && (
            <Text style={styles.coachLabel}>coach</Text>
          )}
          <Text
            style={[styles.messageText, isUser ? styles.userText : styles.aiText]}
            selectable
          >
            {item.content}
          </Text>

          {/* Feedback buttons for AI messages */}
          {!isUser && !item.id.startsWith('temp-') && !item.id.startsWith('ai-') && (
            <View style={styles.feedbackRow}>
              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  item.feedback === 'up' && styles.feedbackActive,
                ]}
                onPress={() => coach.giveFeedback(item.id, 'up')}
              >
                <Ionicons
                  name="thumbs-up-outline"
                  size={12}
                  color={item.feedback === 'up' ? COLORS.accent : COLORS.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  item.feedback === 'down' && styles.feedbackActive,
                ]}
                onPress={() => coach.giveFeedback(item.id, 'down')}
              >
                <Ionicons
                  name="thumbs-down-outline"
                  size={12}
                  color={item.feedback === 'down' ? COLORS.error : COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [coach.giveFeedback]
  );

  const renderEmptyChat = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="chatbubbles-outline" size={28} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>your ai coach</Text>
      <Text style={styles.emptySubtitle}>
        ask anything about your training.{'\n'}i have access to your full workout history.
      </Text>

      {/* Goals summary */}
      {coach.goals.length > 0 && (
        <View style={styles.goalsPreview}>
          <Text style={styles.goalsPreviewTitle}>active goals</Text>
          {coach.goals.slice(0, 3).map((g) => (
            <Text key={g.id} style={styles.goalsPreviewItem}>
              {g.target_description}
            </Text>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.quickActionCard}
            onPress={() => handleQuickAction(action.prompt)}
          >
            <Text style={styles.quickActionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => {
    if (coach.messages.length === 0) return null;
    return (
      <View style={styles.chatHeader}>
        {/* Quick action pills at top of chat */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPillsContainer}
        >
          {QUICK_ACTIONS.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickPill}
              onPress={() => handleQuickAction(action.prompt)}
            >
              <Text style={styles.quickPillText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenTitle}>coach</Text>
            <Text style={styles.screenSubtitle}>
              {coach.goals.length} goal{coach.goals.length !== 1 ? 's' : ''} ·{' '}
              {workoutLogs.length} workouts logged
            </Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.topAction}
              onPress={() => setShowGoalModal(true)}
            >
              <Ionicons name="flag-outline" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topAction}
              onPress={() => setShowSettingsModal(true)}
            >
              <Ionicons name="settings-outline" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {coach.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.textMuted} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={coach.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesList,
              coach.messages.length === 0 && styles.messagesListEmpty,
            ]}
            ListEmptyComponent={renderEmptyChat}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (coach.messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
          />
        )}

        {/* Typing indicator */}
        {coach.sending && (
          <View style={styles.typingRow}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotDelay1]} />
            <View style={[styles.typingDot, styles.typingDotDelay2]} />
            <Text style={styles.typingText}>thinking</Text>
          </View>
        )}

        {/* Error */}
        {coach.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{coach.error}</Text>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="ask your coach..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || coach.sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || coach.sending}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={
                input.trim() && !coach.sending ? COLORS.background : COLORS.textMuted
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Goals Modal */}
      <GoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        goals={coach.goals}
        onAddGoal={coach.addGoal}
        onRemoveGoal={coach.removeGoal}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        style={coach.style}
        onStyleChange={coach.updateStyle}
        onClearHistory={handleClearHistory}
      />
    </SafeAreaView>
  );
};

// ─── Goal Modal ───────────────────────────────────────────
interface GoalModalProps {
  visible: boolean;
  onClose: () => void;
  goals: UserGoal[];
  onAddGoal: (goal: {
    goal_type: UserGoal['goal_type'];
    target_description: string;
    target_value?: number;
  }) => void;
  onRemoveGoal: (id: string) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({
  visible,
  onClose,
  goals,
  onAddGoal,
  onRemoveGoal,
}) => {
  const [goalType, setGoalType] = useState<UserGoal['goal_type']>('strength');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');

  const handleAdd = () => {
    if (!description.trim()) return;
    onAddGoal({
      goal_type: goalType,
      target_description: description.trim(),
      target_value: targetValue ? parseFloat(targetValue) : undefined,
    });
    setDescription('');
    setTargetValue('');
  };

  const handleRemove = (id: string) => {
    Alert.alert('remove goal', 'are you sure?', [
      { text: 'cancel', style: 'cancel' },
      { text: 'remove', style: 'destructive', onPress: () => onRemoveGoal(id) },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>goals</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Existing goals */}
            {goals.length > 0 && (
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionLabel}>active</Text>
                {goals.map((g) => (
                  <View key={g.id} style={modalStyles.goalRow}>
                    <View style={modalStyles.goalInfo}>
                      <Text style={modalStyles.goalDescription}>
                        {g.target_description}
                      </Text>
                      <Text style={modalStyles.goalType}>{g.goal_type}</Text>
                    </View>
                    <TouchableOpacity
                      style={modalStyles.goalRemove}
                      onPress={() => handleRemove(g.id)}
                    >
                      <Ionicons name="close" size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add new goal */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>add goal</Text>

              {/* Goal type */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={modalStyles.typeScroll}
                contentContainerStyle={modalStyles.typeContainer}
              >
                {GOAL_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    style={[
                      modalStyles.typePill,
                      goalType === t.key && modalStyles.typePillActive,
                    ]}
                    onPress={() => setGoalType(t.key)}
                  >
                    <Text
                      style={[
                        modalStyles.typePillText,
                        goalType === t.key && modalStyles.typePillTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Description */}
              <TextInput
                style={modalStyles.input}
                placeholder='e.g. "bench press 225 lbs"'
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
              />

              {/* Target value */}
              <TextInput
                style={modalStyles.input}
                placeholder="target number (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity
                style={[
                  modalStyles.addButton,
                  !description.trim() && modalStyles.addButtonDisabled,
                ]}
                onPress={handleAdd}
                disabled={!description.trim()}
              >
                <Text style={modalStyles.addButtonText}>add goal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Settings Modal ───────────────────────────────────────
interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  style: CoachingStyle;
  onStyleChange: (style: CoachingStyle) => void;
  onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  style,
  onStyleChange,
  onClearHistory,
}) => {
  const styles: { key: CoachingStyle; label: string; desc: string }[] = [
    { key: 'encouraging', label: 'encouraging', desc: 'supportive and motivating' },
    { key: 'strict', label: 'strict', desc: 'blunt and demanding' },
    { key: 'casual', label: 'casual', desc: 'like a gym buddy' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>coach settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionLabel}>coaching style</Text>
            {styles.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[
                  modalStyles.styleRow,
                  style === s.key && modalStyles.styleRowActive,
                ]}
                onPress={() => onStyleChange(s.key)}
              >
                <View>
                  <Text
                    style={[
                      modalStyles.styleLabel,
                      style === s.key && modalStyles.styleLabelActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                  <Text style={modalStyles.styleDesc}>{s.desc}</Text>
                </View>
                {style === s.key && (
                  <Ionicons name="checkmark" size={16} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={modalStyles.section}>
            <TouchableOpacity style={modalStyles.dangerButton} onPress={onClearHistory}>
              <Text style={modalStyles.dangerButtonText}>clear chat history</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '200',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.xs,
  },
  topAction: {
    padding: SPACING.xs,
  },

  // Messages
  messagesList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  messagesListEmpty: {
    flexGrow: 1,
  },
  chatHeader: {
    marginBottom: SPACING.sm,
  },

  // Quick action pills (in-chat)
  quickPillsContainer: {
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  quickPill: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPillText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Message bubbles
  messageBubble: {
    maxWidth: '88%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md + 2,
    marginVertical: SPACING.xs + 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
    paddingLeft: SPACING.md,
    paddingRight: 0,
  },
  coachLabel: {
    fontSize: 9,
    color: COLORS.accent,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    fontWeight: '300',
    letterSpacing: 0.2,
  },
  userText: {
    color: COLORS.text,
  },
  aiText: {
    color: COLORS.textSecondary,
  },

  // Feedback
  feedbackRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  feedbackBtn: {
    padding: SPACING.xs,
  },
  feedbackActive: {
    opacity: 1,
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    opacity: 0.4,
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.8,
  },
  typingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '300',
    letterSpacing: 1,
    marginLeft: 4,
  },

  // Error
  errorBanner: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '300',
    maxHeight: 100,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '300',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },

  // Goals preview
  goalsPreview: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  goalsPreviewTitle: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  goalsPreviewItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '300',
    paddingVertical: 3,
    letterSpacing: 0.3,
  },

  // Quick actions grid (empty state)
  quickActionsGrid: {
    width: '100%',
    gap: SPACING.sm,
  },
  quickActionCard: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});

// ─── Modal Styles ─────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    maxHeight: '85%',
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    paddingVertical: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },

  // Goals
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  goalInfo: {
    flex: 1,
  },
  goalDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  goalType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  goalRemove: {
    padding: SPACING.sm,
  },

  // Goal type pills
  typeScroll: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.lg,
  },
  typeContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  typePill: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typePillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  typePillText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  typePillTextActive: {
    color: COLORS.background,
    fontWeight: '500',
  },

  // Inputs
  input: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '300',
    marginBottom: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Settings
  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  styleRowActive: {
    borderBottomColor: COLORS.accent,
  },
  styleLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  styleLabelActive: {
    color: COLORS.accent,
  },
  styleDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '300',
    marginTop: 2,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default CoachScreen;
