import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { CalendarEvent } from '@/types';
import { colors } from '@/utils/colors';
import { differenceInDays, parseDateValue } from '@/utils/date';

interface CalendarEventCardProps {
  event: CalendarEvent;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ event }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error[500];
      case 'medium': return colors.warning[500];
      case 'low': return colors.accent[500];
      default: return colors.neutral[400];
    }
  };

  const formatTime = (dateString: string) => {
    const date = parseDateValue(dateString);
    if (!date) return '';

    const diffDays = differenceInDays(date, new Date());

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    
    return `${diffDays} days`;
  };

  const eventDate = parseDateValue(event.date);
  const isOverdue = !!eventDate && differenceInDays(eventDate, new Date()) < 0;

  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(event.priority) }]} />
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.boardName} numberOfLines={1}>
            {event.boardTitle}
          </Text>
        </View>
        <View style={[styles.timeContainer, isOverdue && styles.overdueContainer]}>
          {isOverdue ? (
            <AlertCircle size={16} color={colors.error[600]} strokeWidth={2} />
          ) : (
            <Clock size={16} color={colors.neutral[500]} strokeWidth={2} />
          )}
          <Text style={[styles.timeText, isOverdue && styles.overdueText]}>
            {formatTime(event.date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  boardName: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.neutral[100],
  },
  overdueContainer: {
    backgroundColor: colors.error[50],
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  overdueText: {
    color: colors.error[600],
  },
});