import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useWorkouts } from '../../hooks/useWorkouts';
import { WorkoutLog, WeekSection, DayGroup, HistoryFilter } from '../../types';
import { COLORS, SPACING, FONT_SIZES, HISTORY_FILTERS, WORKOUT_CATEGORIES } from '../../constants';
import { groupWorkoutsByWeek, filterWorkouts, formatTimer, calculateTotalVolume } from '../../utils/helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HistoryScreen = () => {
  const { workoutLogs, loading, error, fetchWorkoutLogs } = useWorkouts();
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(new Set());
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutLogs();
    }, [fetchWorkoutLogs])
  );

  // Apply filter and search
  const filteredLogs = useMemo(() => {
    let logs = filterWorkouts(workoutLogs, activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.exercise_name.toLowerCase().includes(q) ||
          (l.category && l.category.toLowerCase().includes(q)) ||
          (l.notes && l.notes.toLowerCase().includes(q))
      );
    }
    return logs;
  }, [workoutLogs, activeFilter, searchQuery]);

  // Group into week sections
  const weekSections = useMemo(() => groupWorkoutsByWeek(filteredLogs), [filteredLogs]);

  // Transform for SectionList (each week is a section, data is day groups)
  const sections = useMemo(() => {
    return weekSections.map((ws) => ({
      ...ws,
      data: collapsedWeeks.has(ws.weekLabel) ? [] : ws.data,
    }));
  }, [weekSections, collapsedWeeks]);

  const toggleWeekCollapse = (weekLabel: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekLabel)) {
        next.delete(weekLabel);
      } else {
        next.add(weekLabel);
      }
      return next;
    });
  };

  const toggleLogExpand = (dayKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  };

  const handleFilterChange = (filter: HistoryFilter) => {
    setActiveFilter(filter);
    setCollapsedWeeks(new Set());
  };

  // Stats summary
  const totalWorkouts = filteredLogs.length;
  const totalVolume = filteredLogs.reduce(
    (sum, l) => sum + calculateTotalVolume(l.sets, l.reps, l.weight),
    0
  );
  const uniqueExercises = new Set(filteredLogs.map((l) => l.exercise_name)).size;

  const renderDayGroup = useCallback(
    ({ item, section }: { item: DayGroup; section: WeekSection }) => {
      const dayKey = `${item.date}|${item.category}`;
      const isExpanded = expandedLogs.has(dayKey);

      return (
        <TouchableOpacity
          style={styles.dayCard}
          onPress={() => toggleLogExpand(dayKey)}
          activeOpacity={0.7}
        >
          {/* Day header */}
          <View style={styles.dayHeader}>
            <View style={styles.dayHeaderLeft}>
              <Text style={styles.dayDate}>{item.date}</Text>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.dayHeaderRight}>
              <Text style={styles.daySets}>{item.totalSets} sets</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Exercise summary */}
          <Text style={styles.dayExercises} numberOfLines={isExpanded ? undefined : 1}>
            {item.exercises}
          </Text>

          {/* Expanded: individual logs */}
          {isExpanded && (
            <View style={styles.expandedLogs}>
              {item.logs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <Text style={styles.logExercise}>{log.exercise_name}</Text>
                  <View style={styles.logStats}>
                    <Text style={styles.logStat}>
                      {log.sets}<Text style={styles.logStatLabel}> s</Text>
                    </Text>
                    <Text style={styles.logStatDot}>·</Text>
                    <Text style={styles.logStat}>
                      {log.reps}<Text style={styles.logStatLabel}> r</Text>
                    </Text>
                    <Text style={styles.logStatDot}>·</Text>
                    <Text style={styles.logStat}>
                      {log.weight}<Text style={styles.logStatLabel}> lbs</Text>
                    </Text>
                  </View>
                  {log.notes && (
                    <Text style={styles.logNotes}>{log.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedLogs]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: WeekSection & { data: DayGroup[] } }) => {
      const isCollapsed = collapsedWeeks.has(section.weekLabel);
      const volumeStr =
        section.totalVolume >= 1000
          ? `${(section.totalVolume / 1000).toFixed(1)}k`
          : section.totalVolume.toString();

      return (
        <TouchableOpacity
          style={styles.weekHeader}
          onPress={() => toggleWeekCollapse(section.weekLabel)}
          activeOpacity={0.7}
        >
          <View style={styles.weekHeaderTop}>
            <Text style={styles.weekLabel}>{section.weekLabel}</Text>
            <Ionicons
              name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
              size={14}
              color={COLORS.textMuted}
            />
          </View>
          <View style={styles.weekStatsRow}>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>{section.totalWorkouts}</Text>
              <Text style={styles.weekStatLabel}>
                {section.totalWorkouts === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View style={styles.weekStatDivider} />
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>{volumeStr}</Text>
              <Text style={styles.weekStatLabel}>volume</Text>
            </View>
            <View style={styles.weekStatDivider} />
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>{section.exercises.length}</Text>
              <Text style={styles.weekStatLabel}>exercises</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [collapsedWeeks]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="barbell-outline" size={32} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>nothing here yet</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'no results match your search'
          : activeFilter !== 'all'
          ? 'no workouts in this time range'
          : 'log your first workout to start tracking your progress'}
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {/* Summary stats */}
      {filteredLogs.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalWorkouts}</Text>
            <Text style={styles.summaryLabel}>logged</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {totalVolume >= 10000
                ? `${(totalVolume / 1000).toFixed(0)}k`
                : totalVolume >= 1000
                ? `${(totalVolume / 1000).toFixed(1)}k`
                : totalVolume}
            </Text>
            <Text style={styles.summaryLabel}>total lbs</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{uniqueExercises}</Text>
            <Text style={styles.summaryLabel}>exercises</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top bar: title + search toggle */}
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>history</Text>
          <TouchableOpacity
            onPress={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="search exercises, categories..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {HISTORY_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                activeFilter === f.key && styles.filterPillActive,
              ]}
              onPress={() => handleFilterChange(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && workoutLogs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.textMuted} />
          </View>
        ) : (
          <SectionList
            sections={sections}
            renderItem={renderDayGroup}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item, index) => `${item.date}|${item.category}|${index}`}
            contentContainerStyle={styles.list}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderEmpty}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchWorkoutLogs}
                tintColor={COLORS.textMuted}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
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
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '200',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '300',
    paddingVertical: 0,
  },

  // Filters
  filterScroll: {
    maxHeight: 44,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  filterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  filterTextActive: {
    color: COLORS.background,
    fontWeight: '500',
  },

  // List
  list: {
    paddingBottom: SPACING.xxl * 2,
  },
  listHeader: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },

  // Summary stats
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.lg,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '300',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  summaryDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: COLORS.border,
  },

  // Week section header
  weekHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  weekHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  weekLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  weekStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '300',
    color: COLORS.text,
  },
  weekStatLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  weekStatDivider: {
    width: 0.5,
    height: 20,
    backgroundColor: COLORS.border,
  },

  // Day card
  dayCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md + 4,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dayDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  dayBadge: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderWidth: 0.5,
    borderColor: COLORS.accent,
  },
  dayBadgeText: {
    fontSize: 9,
    color: COLORS.accent,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  daySets: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  dayExercises: {
    fontSize: FONT_SIZES.md,
    fontWeight: '300',
    color: COLORS.text,
    lineHeight: 20,
  },

  // Expanded log rows
  expandedLogs: {
    marginTop: SPACING.md,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  logRow: {
    paddingVertical: SPACING.xs,
  },
  logExercise: {
    fontSize: FONT_SIZES.md,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  logStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logStat: {
    fontSize: FONT_SIZES.md,
    fontWeight: '300',
    color: COLORS.accent,
  },
  logStatLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  logStatDot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  logNotes: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '300',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 3,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '400',
    fontSize: FONT_SIZES.sm,
    letterSpacing: 0.5,
  },
});

export default HistoryScreen;