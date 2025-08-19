import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Plus, LayoutGrid } from 'lucide-react-native';
import { useBoards } from '@/hooks/useBoards';
import { BoardCard } from '@/components/BoardCard';
import { CreateBoardModal } from '@/components/CreateBoardModal';
import { BoardDetailModal } from '@/components/BoardDetailModal';
import { KanbanBoard } from '@/types';
import { colors } from '@/utils/colors';

export default function BoardsScreen() {
  const { boards, loading, addBoard, deleteBoard } = useBoards();
  const screenWidth = Dimensions.get('window').width;
  const CARD_MIN_WIDTH = 260; // min width per card
  const GAP = 16;
  const columns = Math.max(1, Math.floor((screenWidth - 32 + GAP) / (CARD_MIN_WIDTH + GAP)));
  const cardWidth = Math.floor((screenWidth - 32 - GAP * (columns - 1)) / columns);
  const colPercent = 100 / columns;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<KanbanBoard | null>(null);

  const handleCreateBoard = (board: KanbanBoard) => {
    addBoard(board);
    setShowCreateModal(false);
  };

  const handleDeleteBoard = (boardId: string) => {
    Alert.alert(
      'Delete Board',
      'Are you sure you want to delete this board? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteBoard(boardId)
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading boards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Boards</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {boards.length === 0 ? (
          <View style={styles.emptyState}>
            <LayoutGrid size={48} color={colors.neutral[400]} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No boards yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first board to start organizing your tasks
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Board</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.boardGrid}>
            {boards.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                onPress={() => setSelectedBoard(board)}
                onDelete={() => handleDeleteBoard(board.id)}
                // use percentage width so items spread evenly across the row
                containerStyle={{ width: `${colPercent}%`, paddingHorizontal: GAP / 2 }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CreateBoardModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBoard}
      />

      <BoardDetailModal
        board={selectedBoard}
        visible={!!selectedBoard}
        onClose={() => setSelectedBoard(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  addButton: {
    backgroundColor: colors.primary[600],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  createFirstButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});