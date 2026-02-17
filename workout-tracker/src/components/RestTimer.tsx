import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import ProgressRing from './ProgressRing';
import { formatTimer } from '../utils/helpers';
import { COLORS, SPACING, FONT_SIZES, REST_TIMER_OPTIONS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RestTimerProps {
  remaining: number;
  duration: number;
  isRunning: boolean;
  isFinished: boolean;
  isVisible: boolean;
  progress: number;
  onStart: (seconds?: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
  onDismiss: () => void;
  onSetDuration: (seconds: number) => void;
}

const RestTimer: React.FC<RestTimerProps> = ({
  remaining,
  duration,
  isRunning,
  isFinished,
  isVisible,
  progress,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  onAddTime,
  onDismiss,
  onSetDuration,
}) => {
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    if (isRunning) {
      activateKeepAwakeAsync('rest-timer');
    } else {
      deactivateKeepAwake('rest-timer');
    }
    return () => {
      deactivateKeepAwake('rest-timer');
    };
  }, [isRunning]);

  if (!isVisible) return null;

  // Finished state — banner
  if (isFinished) {
    return (
      <View style={styles.finishedBanner}>
        <View style={styles.finishedContent}>
          <Text style={styles.finishedText}>rest complete</Text>
          <Text style={styles.finishedSub}>time for your next set</Text>
        </View>
        <TouchableOpacity style={styles.finishedAction} onPress={onDismiss}>
          <Text style={styles.finishedActionText}>dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Collapsed — minimal floating pill
  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedContainer}
        onPress={() => setExpanded(true)}
        activeOpacity={0.8}
      >
        <ProgressRing
          progress={progress}
          size={40}
          strokeWidth={2}
          color={isRunning ? COLORS.accent : COLORS.textMuted}
        >
          <Text style={styles.collapsedTime}>{formatTimer(remaining)}</Text>
        </ProgressRing>
        <Text style={styles.collapsedLabel}>
          {isRunning ? 'resting' : 'paused'}
        </Text>
      </TouchableOpacity>
    );
  }

  // Expanded — full timer view
  return (
    <View style={styles.expandedContainer}>
      {/* Header */}
      <View style={styles.expandedHeader}>
        <Text style={styles.expandedTitle}>rest timer</Text>
        <TouchableOpacity onPress={() => setExpanded(false)}>
          <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Ring + Time */}
      <View style={styles.ringSection}>
        <ProgressRing
          progress={progress}
          size={140}
          strokeWidth={3}
          color={isRunning ? COLORS.accent : COLORS.textMuted}
        >
          <Text style={styles.timerText}>{formatTimer(remaining)}</Text>
          <Text style={styles.timerLabel}>
            {isRunning ? 'resting' : remaining === duration ? 'ready' : 'paused'}
          </Text>
        </ProgressRing>
      </View>

      {/* Duration Presets */}
      {!isRunning && remaining === duration && (
        <View style={styles.presetsRow}>
          {REST_TIMER_OPTIONS.map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[
                styles.presetPill,
                duration === sec && styles.presetPillActive,
              ]}
              onPress={() => onSetDuration(sec)}
            >
              <Text
                style={[
                  styles.presetText,
                  duration === sec && styles.presetTextActive,
                ]}
              >
                {formatTimer(sec)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsRow}>
        {!isRunning && remaining === duration ? (
          // Not started
          <>
            <TouchableOpacity style={styles.controlButton} onPress={onSkip}>
              <Text style={styles.controlText}>close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onStart(duration)}
            >
              <Text style={styles.primaryButtonText}>start</Text>
            </TouchableOpacity>
          </>
        ) : isRunning ? (
          // Running
          <>
            <TouchableOpacity style={styles.controlButton} onPress={() => onAddTime(15)}>
              <Text style={styles.controlText}>+15s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={onPause}>
              <Ionicons name="pause" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={onSkip}>
              <Text style={styles.controlText}>skip</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Paused
          <>
            <TouchableOpacity style={styles.controlButton} onPress={onReset}>
              <Text style={styles.controlText}>reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onResume}>
              <Text style={styles.primaryButtonText}>resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={onSkip}>
              <Text style={styles.controlText}>skip</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Collapsed floating pill
  collapsedContainer: {
    position: 'absolute',
    bottom: 100,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    zIndex: 100,
    elevation: 10,
  },
  collapsedTime: {
    fontSize: 9,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  collapsedLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Expanded overlay
  expandedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl + 20,
    zIndex: 100,
    elevation: 10,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  expandedTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '200',
    color: COLORS.text,
    letterSpacing: 1,
  },
  timerLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Presets
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  presetPill: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  presetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
  },
  presetTextActive: {
    color: COLORS.background,
    fontWeight: '500',
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  controlButton: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  controlText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  primaryButton: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Finished banner
  finishedBanner: {
    position: 'absolute',
    bottom: 80,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    zIndex: 100,
    elevation: 10,
  },
  finishedContent: {
    flex: 1,
  },
  finishedText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.background,
    letterSpacing: 0.5,
  },
  finishedSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.background,
    fontWeight: '300',
    marginTop: 2,
    opacity: 0.8,
  },
  finishedAction: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  finishedActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.background,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default RestTimer;
