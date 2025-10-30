import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { CalendarDays, List } from 'lucide-react-native';
import { useBoards } from '@/hooks/useBoards';
import { CalendarEventCard } from '@/components/CalendarEventCard';
import { CalendarGrid } from '@/components/CalendarGrid';
import { getCalendarEvents } from '@/utils/data';
import { colors } from '@/utils/colors';
import { parseDateValue, toDateKey } from '@/utils/date';

export default function CalendarScreen() {
  const { boards, loading } = useBoards();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>('all');

  const filteredBoards = useMemo(() => {
    if (selectedBoardId === 'all') {
      return boards;
    }
    return boards.filter(board => board.id === selectedBoardId);
  }, [boards, selectedBoardId]);

  const events = useMemo(() => {
    return getCalendarEvents(filteredBoards);
  }, [filteredBoards]);

  const groupedEvents = useMemo(() => {
    const groups: { [date: string]: typeof events } = {};
    
    events.forEach(event => {
      const parsed = parseDateValue(event.date);
      if (!parsed) return;
      const key = toDateKey(parsed);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });
    
    return groups;
  }, [events]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>
            {events.length} upcoming tasks
          </Text>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List size={20} color={colors.neutral[600]} strokeWidth={2} />
            ) : (
              <CalendarDays size={20} color={colors.neutral[600]} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardFilterContainer}
        style={styles.boardFilterWrapper}
      >
        <TouchableOpacity
          style={[styles.boardFilterChip, selectedBoardId === 'all' && styles.boardFilterChipActive]}
          onPress={() => setSelectedBoardId('all')}
        >
          <Text style={[styles.boardFilterText, selectedBoardId === 'all' && styles.boardFilterTextActive]}>All Boards</Text>
        </TouchableOpacity>
        {boards.map(board => {
          const isActive = selectedBoardId === board.id;
          return (
            <TouchableOpacity
              key={board.id}
              style={[styles.boardFilterChip, isActive && styles.boardFilterChipActive]}
              onPress={() => setSelectedBoardId(isActive ? 'all' : board.id)}
            >
              <Text style={[styles.boardFilterText, isActive && styles.boardFilterTextActive]}>
                {board.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarDays size={48} color={colors.neutral[400]} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No upcoming tasks</Text>
            <Text style={styles.emptySubtitle}>
              Add due dates to your tasks to see them here
            </Text>
          </View>
        ) : viewMode === 'grid' ? (
          <CalendarGrid
            events={events}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        ) : (
          Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
            const parsed = parseDateValue(dateKey);
            const label = parsed
              ? parsed.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                })
              : dateKey;
            return (
              <View key={dateKey} style={styles.daySection}>
                <Text style={styles.dateHeader}>{label}</Text>
                {dayEvents.map(event => (
                  <CalendarEventCard key={event.id} event={event} />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 4,
    flex: 1,
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  boardFilterWrapper: {
    maxHeight: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  boardFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  boardFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
    marginRight: 12,
  },
  boardFilterChipActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  boardFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  boardFilterTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  daySection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});