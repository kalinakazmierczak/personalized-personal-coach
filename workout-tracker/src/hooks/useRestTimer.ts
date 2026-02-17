import { useState, useRef, useEffect, useCallback } from 'react';
import { Vibration, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_REST_SECONDS } from '../constants';

const TIMER_STORAGE_KEY = 'rest_timer_state';

interface TimerState {
  isRunning: boolean;
  remaining: number;
  duration: number;
  startedAt: number | null; // epoch ms when timer was started
}

export const useRestTimer = () => {
  const [remaining, setRemaining] = useState(DEFAULT_REST_SECONDS);
  const [duration, setDuration] = useState(DEFAULT_REST_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  // Restore timer state on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (!stored) return;
        const state: TimerState = JSON.parse(stored);
        if (state.isRunning && state.startedAt) {
          const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
          const left = Math.max(0, state.duration - elapsed);
          if (left > 0) {
            setDuration(state.duration);
            setRemaining(left);
            setIsRunning(true);
            setIsVisible(true);
            startedAtRef.current = state.startedAt;
          } else {
            // Timer finished while app was closed
            setDuration(state.duration);
            setRemaining(0);
            setIsFinished(true);
            setIsVisible(true);
            await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
          }
        }
      } catch {}
    };
    restore();
  }, []);

  // Handle app state (background/foreground) for persistence
  useEffect(() => {
    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState === 'active' && isRunning && startedAtRef.current) {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        const left = Math.max(0, duration - elapsed);
        setRemaining(left);
        if (left === 0) {
          setIsRunning(false);
          setIsFinished(true);
          Vibration.vibrate([0, 500, 200, 500]);
          await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isRunning, duration]);

  // Main countdown interval
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            Vibration.vibrate([0, 500, 200, 500]);
            AsyncStorage.removeItem(TIMER_STORAGE_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const persistState = useCallback(async (dur: number) => {
    const now = Date.now();
    startedAtRef.current = now;
    const state: TimerState = {
      isRunning: true,
      remaining: dur,
      duration: dur,
      startedAt: now,
    };
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, []);

  const start = useCallback(async (seconds?: number) => {
    const dur = seconds || duration;
    setDuration(dur);
    setRemaining(dur);
    setIsRunning(true);
    setIsFinished(false);
    setIsVisible(true);
    await persistState(dur);
  }, [duration, persistState]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resume = useCallback(async () => {
    setIsRunning(true);
    startedAtRef.current = Date.now() - (duration - remaining) * 1000;
    const state: TimerState = {
      isRunning: true,
      remaining,
      duration,
      startedAt: startedAtRef.current,
    };
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, [remaining, duration]);

  const reset = useCallback(async () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemaining(duration);
    startedAtRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
  }, [duration]);

  const skip = useCallback(async () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemaining(duration);
    setIsVisible(false);
    startedAtRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
  }, [duration]);

  const addTime = useCallback((seconds: number) => {
    setRemaining((prev) => prev + seconds);
  }, []);

  const dismiss = useCallback(() => {
    setIsFinished(false);
    setIsVisible(false);
    setRemaining(duration);
  }, [duration]);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    if (!isRunning) {
      setIsVisible(false);
    }
  }, [isRunning]);

  const progress = duration > 0 ? remaining / duration : 0;

  return {
    remaining,
    duration,
    isRunning,
    isFinished,
    isVisible,
    progress,
    start,
    pause,
    resume,
    reset,
    skip,
    addTime,
    dismiss,
    show,
    hide,
    setDuration: (s: number) => { setDuration(s); setRemaining(s); },
  };
};
