import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Calendar, CircleAlert as AlertCircle } from 'lucide-react-native';
import { KanbanCard } from '@/types';
import { colors } from '@/utils/colors';
import { differenceInDays, parseDateValue } from '@/utils/date';

interface TaskCardProps {
  card: KanbanCard;
}

export const TaskCard: React.FC<TaskCardProps> = ({ card }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error[500];
      case 'medium': return colors.warning[500];
      case 'low': return colors.accent[500];
      default: return colors.neutral[400];
    }
  };

  const formatDueDate = (dateString: string) => {
    const dueDate = parseDateValue(dateString);
    if (!dueDate) return '';

    const diffDays = differenceInDays(dueDate, new Date());

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;

    return dueDate.toLocaleDateString();
  };

  const dueDate = parseDateValue(card.dueDate);
  const isOverdue = !!dueDate && differenceInDays(dueDate, new Date()) < 0;

  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(card.priority) }]} />
        <Text style={styles.title} numberOfLines={2}>
          {card.title}
        </Text>
      </View>
      
      {card.description && (
        <Text style={styles.description} numberOfLines={3}>
          {card.description}
        </Text>
      )}
      
      {card.dueDate && (
        <View style={[styles.dueDate, isOverdue && styles.overdue]}>
          {isOverdue ? (
            <AlertCircle size={14} color={colors.error[600]} strokeWidth={2} />
          ) : (
            <Calendar size={14} color={colors.neutral[500]} strokeWidth={2} />
          )}
          <Text style={[styles.dueDateText, isOverdue && styles.overdueText]}>
            {formatDueDate(card.dueDate)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
    elevation: 2,
  boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
    lineHeight: 18,
  },
  description: {
    fontSize: 12,
    color: colors.neutral[600],
    lineHeight: 16,
    marginBottom: 12,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overdue: {
    backgroundColor: colors.error[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: -4,
  },
  dueDateText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  overdueText: {
    color: colors.error[600],
    fontWeight: '600',
  },
});