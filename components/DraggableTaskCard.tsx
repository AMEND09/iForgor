import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Calendar, CircleAlert as AlertCircle } from 'lucide-react-native';
import { KanbanCard } from '@/types';
import { useCardDrag } from '@/components/CardDragProvider';
import { colors } from '@/utils/colors';
import { differenceInDays, parseDateValue } from '@/utils/date';

interface DraggableTaskCardProps {
  card: KanbanCard;
  isDragging?: boolean;
  onPress?: () => void;
  onEdit?: (card: KanbanCard) => void;
  onReorderDrag?: () => void;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ 
  card, 
  isDragging = false,
  onPress,
  onEdit,
  onReorderDrag,
}) => {
  const lastTap = React.useRef<number | null>(null);
  const singleTapTimeout = React.useRef<any>(null);
  const DOUBLE_TAP_DELAY = 300; // ms
  const cardLayout = React.useRef({ width: 0, height: 0 });
  const dragStartedRef = React.useRef(false);

  const {
    startDrag,
    endDrag,
    dropCard,
    updateDragPosition,
    draggedCard,
    isDragging: globalDragging,
  } = useCardDrag();

  const isCurrentDrag = React.useMemo(() => {
    return globalDragging && draggedCard?.id === card.id;
  }, [globalDragging, draggedCard, card.id]);

  React.useEffect(() => {
    return () => {
      if (singleTapTimeout.current) {
        clearTimeout(singleTapTimeout.current);
      }
    };
  }, []);

  const handlePress = () => {
    if (dragStartedRef.current) {
      dragStartedRef.current = false;
      return;
    }
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

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    cardLayout.current = { width, height };
  };

  const handlePanGrant = React.useCallback(
    (evt: GestureResponderEvent) => {
      const { pageX, pageY, locationX, locationY } = evt.nativeEvent;
      dragStartedRef.current = true;
      startDrag(card, card.columnId, {
        offset: { x: locationX, y: locationY },
        size: cardLayout.current.width ? cardLayout.current : undefined,
      });
      updateDragPosition(pageX, pageY);
    },
    [card, startDrag, updateDragPosition]
  );

  const handlePanMove = React.useCallback(
    (evt: GestureResponderEvent) => {
      if (!dragStartedRef.current) return;
      const { pageX, pageY } = evt.nativeEvent;
      updateDragPosition(pageX, pageY);
    },
    [updateDragPosition]
  );

  const handlePanRelease = React.useCallback(() => {
    if (!dragStartedRef.current) return;
    dragStartedRef.current = false;
    dropCard();
  }, [dropCard]);

  const handlePanTerminate = React.useCallback(() => {
    if (!dragStartedRef.current) return;
    dragStartedRef.current = false;
    endDrag();
  }, [endDrag]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (globalDragging && !isCurrentDrag) {
            return false;
          }
          const primaryDelta = Math.max(Math.abs(gesture.dx), Math.abs(gesture.dy));
          return primaryDelta > 8;
        },
        onPanResponderGrant: handlePanGrant,
        onPanResponderMove: handlePanMove,
        onPanResponderRelease: handlePanRelease,
        onPanResponderTerminate: handlePanTerminate,
        onPanResponderTerminationRequest: () => false,
      }),
    [globalDragging, isCurrentDrag, handlePanGrant, handlePanMove, handlePanRelease, handlePanTerminate]
  );

  const dueDate = parseDateValue(card.dueDate);
  const isOverdue = !!dueDate && differenceInDays(dueDate, new Date()) < 0;

  return (
    <View {...panResponder.panHandlers}>
      <TouchableOpacity
        style={[
          styles.container,
          isDragging && styles.dragging,
          globalDragging && styles.dragMode,
          isCurrentDrag && styles.dragPlaceholder,
        ]}
        onPress={handlePress}
        onLongPress={onReorderDrag}
        onLayout={handleLayout}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View
            style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(card.priority) }]}
          />
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
    </View>
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
  dragPlaceholder: {
    opacity: 0,
  },
});