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

export default function CalendarScreen() {
  const { boards, loading } = useBoards();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const events = useMemo(() => {
    return getCalendarEvents(boards);
  }, [boards]);

  const groupedEvents = useMemo(() => {
    const groups: { [date: string]: typeof events } = {};
    
    events.forEach(event => {
      const date = new Date(event.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
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
          Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <View key={date} style={styles.daySection}>
              <Text style={styles.dateHeader}>{date}</Text>
              {dayEvents.map(event => (
                <CalendarEventCard key={event.id} event={event} />
              ))}
            </View>
          ))
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