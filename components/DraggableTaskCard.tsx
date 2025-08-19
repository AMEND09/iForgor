import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Calendar, CircleAlert as AlertCircle } from 'lucide-react-native';
import { KanbanCard } from '@/types';
import { useCardDrag } from '@/components/CardDragProvider';
import { colors } from '@/utils/colors';

interface DraggableTaskCardProps {
  card: KanbanCard;
  isDragging?: boolean;
  onPress?: () => void;
  onEdit?: (card: KanbanCard) => void;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ 
  card, 
  isDragging = false,
  onPress,
  onEdit,
}) => {
  const lastTap = React.useRef<number | null>(null);
  const singleTapTimeout = React.useRef<any>(null);
  const DOUBLE_TAP_DELAY = 300; // ms

  React.useEffect(() => {
    return () => {
      if (singleTapTimeout.current) {
        clearTimeout(singleTapTimeout.current);
      }
    };
  }, []);

  const handlePress = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      // double tap
      if (singleTapTimeout.current) {
        clearTimeout(singleTapTimeout.current);
        singleTapTimeout.current = null;
      }
      lastTap.current = null;
      if (onEdit) onEdit(card);
      return;
    }

    lastTap.current = now;
    // wait to confirm single tap
    singleTapTimeout.current = setTimeout(() => {
      lastTap.current = null;
      if (onPress) onPress();
    }, DOUBLE_TAP_DELAY);
  };
  // Try to use card drag context, but don't fail if not available
  let startDrag: (card: any, columnId: string) => void = () => {};
  let endDrag = () => {};
  let globalIsDragging = false;
  
  try {
    const dragContext = useCardDrag();
    startDrag = dragContext.startDrag;
    endDrag = dragContext.endDrag;
    globalIsDragging = dragContext.isDragging;
  } catch (e) {
    // CardDragProvider not available, use fallback
  }
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error[500];
      case 'medium': return colors.warning[500];
      case 'low': return colors.accent[500];
      default: return colors.neutral[400];
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const handlePressIn = () => {
    startDrag(card, card.columnId);
  };

  // removed long-press edit; using double-tap via handlePress

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isDragging && styles.dragging,
        globalIsDragging && styles.dragMode
      ]}
      onPress={handlePress}
  onPressIn={handlePressIn}
      activeOpacity={0.8}
    >
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
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
  },
  dragging: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  boxShadow: '0px 8px 16px rgba(0,0,0,0.12)',
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
  dragMode: {
    opacity: 0.6,
  },
});