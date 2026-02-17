import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface AIChatBubbleProps {
  message: string;
  isUser: boolean;
}

const AIChatBubble: React.FC<AIChatBubbleProps> = ({ message, isUser }) => {
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '90%',
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },
  userBubble: {
    backgroundColor: COLORS.surfaceElevated,
    alignSelf: 'flex-end',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  aiBubble: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
    paddingLeft: SPACING.md,
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
});

export default AIChatBubble;