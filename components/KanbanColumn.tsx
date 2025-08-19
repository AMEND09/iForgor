import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { KanbanColumn as KanbanColumnType, KanbanCard } from '@/types';
import { TaskCard } from '@/components/TaskCard';
import { colors } from '@/utils/colors';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onMoveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  onAddCard: () => void;
}

const { width } = Dimensions.get('window');
const columnWidth = Math.min(280, width - 80);

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  onMoveCard,
  onAddCard,
}) => {
  return (
    <View style={[styles.container, { width: columnWidth }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{column.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{column.cards.length}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.cardsList}
        contentContainerStyle={styles.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        {column.cards.map(card => (
          <TaskCard key={card.id} card={card} />
        ))}
        
        <TouchableOpacity style={styles.addButton} onPress={onAddCard}>
          <Plus size={20} color={colors.neutral[500]} strokeWidth={2} />
          <Text style={styles.addButtonText}>Add a card</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    maxHeight: '100%',
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
  },
  cardsContent: {
    padding: 16,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: '500',
  },
});