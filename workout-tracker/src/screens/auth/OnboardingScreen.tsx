import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const OnboardingScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.brand}>the</Text>
          <Text style={styles.title}>workout{'\n'}tracker</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            log your lifts. track your progress.{'\n'}stay consistent.
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.primaryButtonText}>get started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>i have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: 'space-between',
    padding: SPACING.xl,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
  },
  brand: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '300',
    color: COLORS.textMuted,
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.display,
    fontWeight: '200',
    color: COLORS.text,
    letterSpacing: -1,
    lineHeight: 46,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.accent,
    marginVertical: SPACING.lg,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    lineHeight: 26,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  buttonSection: {
    gap: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.md + 2,
    borderRadius: 0,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    paddingVertical: SPACING.md + 2,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '400',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default OnboardingScreen;