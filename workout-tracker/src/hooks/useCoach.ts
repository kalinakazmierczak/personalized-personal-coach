import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, UserGoal, WorkoutLog, CoachingStyle } from '../types';
import { sendCoachMessage } from '../services/aiChat';
import {
  getChatMessages,
  saveChatMessage,
  updateMessageFeedback,
  clearChatHistory as clearChatHistoryDb,
  getUserGoals,
  setUserGoal,
  updateGoal,
  deleteGoal as deleteGoalDb,
} from '../services/supabase';
import useAuth from './useAuth';

const COACHING_STYLE_KEY = 'coaching_style';

export const useCoach = (workoutLogs: WorkoutLog[]) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [style, setStyle] = useState<CoachingStyle>('encouraging');
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  // Load coaching style
  useEffect(() => {
    AsyncStorage.getItem(COACHING_STYLE_KEY).then((val) => {
      if (val && ['encouraging', 'strict', 'casual'].includes(val)) {
        setStyle(val as CoachingStyle);
      }
    });
  }, []);

  // Fetch messages and goals on mount
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [msgResult, goalResult] = await Promise.all([
        getChatMessages(user.id),
        getUserGoals(user.id),
      ]);

      if (msgResult.data) {
        setMessages(msgResult.data as ChatMessage[]);
      }
      if (goalResult.data) {
        setGoals(goalResult.data as UserGoal[]);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      hasLoaded.current = true;
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Send message to coach
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;
    setSending(true);
    setError(null);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      role: 'user',
      content: content.trim(),
      feedback: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      // Save user message to DB
      const { data: savedUserMsg } = await saveChatMessage({
        user_id: user.id,
        role: 'user',
        content: content.trim(),
      });

      // Replace temp with real
      if (savedUserMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempUserMsg.id ? (savedUserMsg as ChatMessage) : m))
        );
      }

      // Build conversation history
      const conversationHistory = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      // Get AI response
      const aiResponse = await sendCoachMessage(
        content.trim(),
        conversationHistory,
        workoutLogs,
        goals,
        style
      );

      // Save assistant message
      const { data: savedAiMsg } = await saveChatMessage({
        user_id: user.id,
        role: 'assistant',
        content: aiResponse,
      });

      if (savedAiMsg) {
        setMessages((prev) => [...prev, savedAiMsg as ChatMessage]);
      } else {
        // Fallback: add locally
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            user_id: user.id,
            role: 'assistant' as const,
            content: aiResponse,
            feedback: null,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e: any) {
      setError('failed to send message. try again.');
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  }, [user, messages, workoutLogs, goals, style]);

  // Feedback
  const giveFeedback = useCallback(async (messageId: string, feedback: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
    );
    await updateMessageFeedback(messageId, feedback);
  }, []);

  // Clear history
  const clearHistory = useCallback(async () => {
    if (!user) return;
    await clearChatHistoryDb(user.id);
    setMessages([]);
  }, [user]);

  // Goals CRUD
  const addGoal = useCallback(async (goal: {
    goal_type: UserGoal['goal_type'];
    target_description: string;
    target_value?: number;
    target_date?: string;
  }) => {
    if (!user) return;
    const { data } = await setUserGoal({
      user_id: user.id,
      goal_type: goal.goal_type,
      target_description: goal.target_description,
      target_value: goal.target_value,
    });
    if (data && data.length > 0) {
      setGoals((prev) => [...prev, data[0] as UserGoal]);
    }
  }, [user]);

  const removeGoal = useCallback(async (goalId: string) => {
    await deleteGoalDb(goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  const deactivateGoal = useCallback(async (goalId: string) => {
    await updateGoal(goalId, { is_active: false });
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  // Style
  const updateStyle = useCallback(async (newStyle: CoachingStyle) => {
    setStyle(newStyle);
    await AsyncStorage.setItem(COACHING_STYLE_KEY, newStyle);
  }, []);

  return {
    messages,
    goals,
    loading,
    sending,
    error,
    style,
    sendMessage,
    giveFeedback,
    clearHistory,
    addGoal,
    removeGoal,
    deactivateGoal,
    updateStyle,
    refreshData: fetchData,
  };
};
