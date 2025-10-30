import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { KanbanColumn as KanbanColumnType, KanbanCard } from '@/types';
import { DraggableTaskCard } from '@/components/DraggableTaskCard';
import { useCardDrag } from '@/components/CardDragProvider';
import { colors } from '@/utils/colors';

import { Edit, Trash2 } from 'lucide-react-native';

interface DraggableKanbanColumnProps {
  column: KanbanColumnType;
  onMoveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void | Promise<void>;
  onAddCard: () => void;
  onReorderCards: (cards: KanbanCard[]) => void | Promise<void>;
  onRenameColumn?: (columnId: string, title: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onEditCard?: (cardId: string, columnId: string) => void;
  containerStyle?: any;
}

const { width, height: windowHeight } = Dimensions.get('window');
const columnWidth = Math.min(280, width - 80);
const COLUMN_MAX_HEIGHT = Math.max(320, Math.floor(windowHeight - 200));

export const DraggableKanbanColumn: React.FC<DraggableKanbanColumnProps> = ({
  column,
  onMoveCard,
  onAddCard,
  onReorderCards,
  onRenameColumn,
  onDeleteColumn,
  onEditCard,
  containerStyle,
}) => {
  const {
    isDragging,
    draggedFromColumn,
    hoverColumnId,
    registerColumn,
    unregisterColumn,
  } = useCardDrag();

  const containerRef = React.useRef<View>(null);

  const measureColumn = React.useCallback(() => {
    const node = containerRef.current;
    if (!node) return;
    node.measureInWindow((x, y, w, h) => {
      registerColumn(column.id, { x, y, width: w, height: h });
    });
  }, [column.id, registerColumn]);

  React.useEffect(() => {
    measureColumn();
  }, [measureColumn, column.cards.length]);

  React.useEffect(() => {
    return () => {
      unregisterColumn(column.id);
    };
  }, [column.id, unregisterColumn]);

  const isDropTarget = isDragging && hoverColumnId === column.id && draggedFromColumn !== column.id;

  const handleLayout = React.useCallback(() => {
    measureColumn();
  }, [measureColumn]);

  const renderCard = ({ item, drag, isActive }: RenderItemParams<KanbanCard>) => (
    <ScaleDecorator>
      <DraggableTaskCard
        card={item}
        isDragging={isActive}
        onEdit={(card) => onEditCard && onEditCard(card.id, column.id)}
        onReorderDrag={drag}
      />
    </ScaleDecorator>
  );

  const handleDragEnd = ({ data }: { data: KanbanCard[] }) => {
    onReorderCards(data);
  };

  return (
    <View
      ref={containerRef}
      onLayout={handleLayout}
      style={[
        styles.container,
        { width: columnWidth },
        containerStyle,
        isDropTarget && styles.dropTarget,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <Text style={styles.title}>{column.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{column.cards.length}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {onRenameColumn && (
            <TouchableOpacity onPress={() => onRenameColumn(column.id, column.title)} style={styles.headerActionButton}>
              <Edit size={18} color={colors.neutral[600]} strokeWidth={2} />
            </TouchableOpacity>
          )}
          {onDeleteColumn && (
            <TouchableOpacity onPress={() => onDeleteColumn(column.id)} style={styles.headerActionButton}>
              <Trash2 size={18} color={colors.neutral[600]} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.cardsList}>
        <DraggableFlatList
          data={column.cards}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.cardsContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
          style={{ maxHeight: COLUMN_MAX_HEIGHT }}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  badge: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  cardsList: {
  flex: 1,
  minHeight: 120,
  },
  cardsContent: {
    padding: 16,
    paddingBottom: 24,
  },
  
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 6,
    marginLeft: 8,
  },
  dropTarget: {
    borderWidth: 2,
    borderColor: colors.primary[100],
    backgroundColor: colors.primary[50],
  },
  // dropHover removed in responder-based version
});