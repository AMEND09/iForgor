import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { MoveVertical as MoreVertical } from 'lucide-react-native';
import { KanbanBoard } from '@/types';
import { colors } from '@/utils/colors';

interface BoardCardProps {
  board: KanbanBoard;
  onPress: () => void;
  onDelete: () => void;
  containerStyle?: ViewStyle | any;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with 16px gap and 16px padding on each side

export const BoardCard: React.FC<BoardCardProps> = ({ board, onPress, onDelete, containerStyle }) => {
  const totalCards = board.columns.reduce((sum, col) => sum + col.cards.length, 0);
  const completedCards = board.columns
    .find(col => col.title.toLowerCase().includes('done'))?.cards.length || 0;

  return (
    <TouchableOpacity style={[styles.card, containerStyle]} onPress={onPress}>
      <View style={[styles.colorBar, { backgroundColor: board.color }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {board.title}
          </Text>
          <TouchableOpacity style={styles.menuButton} onPress={onDelete}>
            <MoreVertical size={16} color={colors.neutral[400]} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        
        {board.description && (
          <Text style={styles.description} numberOfLines={2}>
            {board.description}
          </Text>
        )}
        
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {totalCards} tasks
          </Text>
          <Text style={styles.statsDivider}>•</Text>
          <Text style={styles.statsText}>
            {completedCards} done
          </Text>
        </View>
        
        <View style={styles.columns}>
          {board.columns.slice(0, 3).map(column => (
            <View key={column.id} style={styles.columnIndicator}>
              <Text style={styles.columnTitle} numberOfLines={1}>
                {column.title}
              </Text>
              <Text style={styles.columnCount}>
                {column.cards.length}
              </Text>
            </View>
          ))}
          {board.columns.length > 3 && (
            <Text style={styles.moreColumns}>
              +{board.columns.length - 3} more
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
  },
  colorBar: {
    height: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
    marginRight: 8,
  },
  menuButton: {
    padding: 4,
  },
  description: {
    fontSize: 12,
    color: colors.neutral[600],
    lineHeight: 16,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  statsDivider: {
    fontSize: 12,
    color: colors.neutral[300],
    marginHorizontal: 8,
  },
  columns: {
    gap: 8,
  },
  columnIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  columnTitle: {
    fontSize: 12,
    color: colors.neutral[600],
    flex: 1,
  },
  columnCount: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  moreColumns: {
    fontSize: 10,
    color: colors.neutral[400],
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});