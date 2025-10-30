import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, Plus, Edit, Trash2 } from 'lucide-react-native';
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/types';
import { DraggableKanbanColumn } from '@/components/DraggableKanbanColumn';
import { CreateCardModal } from '@/components/CreateCardModal';
import { CardDragProvider, useCardDrag } from '@/components/CardDragProvider';
import { TaskCard } from '@/components/TaskCard';
import { colors } from '@/utils/colors';

interface BoardDetailModalProps {
  board: KanbanBoard | null;
  visible: boolean;
  onClose: () => void;
  boards: KanbanBoard[];
  onAddColumn: (boardId: string, column: KanbanColumn) => void | Promise<void>;
  onUpdateColumn: (boardId: string, column: KanbanColumn) => void | Promise<void>;
  onDeleteColumn: (boardId: string, columnId: string) => void | Promise<void>;
  onReorderColumnCards: (boardId: string, columnId: string, cards: KanbanCard[]) => void | Promise<void>;
  onAddCard: (boardId: string, columnId: string, card: KanbanCard) => void | Promise<void>;
  onUpdateCard: (boardId: string, columnId: string, card: KanbanCard) => void | Promise<void>;
  onDeleteCard: (boardId: string, columnId: string, cardId: string) => void | Promise<void>;
  onMoveCard: (cardId: string, fromColumnId: string, toColumnId: string, boardId: string) => void | Promise<void>;
}

const { width } = Dimensions.get('window');

const DragPreview: React.FC = () => {
  const { draggedCard, dragPosition, dragOffset, dragCardSize, isDragging } = useCardDrag();

  if (!isDragging || !draggedCard || !dragPosition) {
    return null;
  }

  const width = dragCardSize?.width ?? 260;
  const height = dragCardSize?.height ?? 120;
  const offsetX = dragOffset?.x ?? width / 2;
  const offsetY = dragOffset?.y ?? height / 2;

  const left = dragPosition.x - offsetX;
  const top = dragPosition.y - offsetY;

  return (
    <View pointerEvents="none" style={[styles.dragPreview, { left, top, width }]}>
      <TaskCard card={draggedCard} />
    </View>
  );
};

export const BoardDetailModal: React.FC<BoardDetailModalProps> = ({
  board,
  visible,
  onClose,
  boards,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumnCards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
}) => {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnModalMode, setColumnModalMode] = useState<'create' | 'rename'>('create');
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [columnTitleInput, setColumnTitleInput] = useState('');

  // Screen width state must be declared unconditionally to preserve hook order
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const handler = ({ window }: { window: { width: number } }) => setScreenWidth(window.width);
    const sub: any = (Dimensions as any).addEventListener ? (Dimensions as any).addEventListener('change', handler) : null;
    return () => {
      if (sub && typeof sub.remove === 'function') sub.remove();
      else if ((Dimensions as any).removeEventListener) (Dimensions as any).removeEventListener('change', handler);
    };
  }, []);

  if (!board) return null;
  const activeBoard = boards.find(b => b.id === board.id) || board;
  const GAP = 16;

  const visibleColumns = Math.max(1, activeBoard.columns.length);
  const minColumnWidth = 280;
  const maxColumnWidth = 420;
  let colWidthPx: number;
  if (screenWidth <= 600) {
    // mobile: one column per screen (allow horizontal scroll between columns)
    colWidthPx = screenWidth - 32; // padding left/right
  } else {
    // desktop/tablet: split evenly but don't exceed max width
    const calc = Math.floor((screenWidth - 32 - GAP * (visibleColumns - 1)) / visibleColumns);
    colWidthPx = Math.min(maxColumnWidth, Math.max(minColumnWidth, calc));
  }

  const handleCreateCard = async (card: KanbanCard) => {
    await onAddCard(activeBoard.id, card.columnId, card);
    setShowCreateCard(false);
  };

  const handleUpdateCard = async (card: KanbanCard) => {
    await onUpdateCard(activeBoard.id, card.columnId, card);
    setEditingCard(null);
    setShowCreateCard(false);
  };
  const handleCreateColumn = async (title: string) => {
    if (!title.trim()) return;
    const id = `${activeBoard.id}-col-${Date.now()}`;
    const newColumn: KanbanColumn = {
      id,
      title: title.trim(),
      boardId: activeBoard.id,
      order: activeBoard.columns.length,
      cards: [],
    };
    await onAddColumn(activeBoard.id, newColumn);
    setShowColumnModal(false);
    setColumnTitleInput('');
  };

  const handleRenameColumn = async (columnId: string, _title: string) => {
  const column = activeBoard.columns.find(c => c.id === columnId);
    if (!column) return;
    setEditingColumn(column);
    setColumnTitleInput(column.title);
    setColumnModalMode('rename');
    setShowColumnModal(true);
  };

  const confirmRenameColumn = async () => {
    if (!editingColumn) return;
    const updated: KanbanColumn = { ...editingColumn, title: columnTitleInput.trim() };
    await onUpdateColumn(activeBoard.id, updated);
    setShowColumnModal(false);
    setEditingColumn(null);
    setColumnTitleInput('');
  };

  const handleDeleteColumn = async (columnId: string) => {
    await onDeleteColumn(activeBoard.id, columnId);
  };

  const handleMoveCard = async (cardId: string, fromColumnId: string, toColumnId: string) => {
    await onMoveCard(cardId, fromColumnId, toColumnId, activeBoard.id);
  };

  const openCreateCard = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowCreateCard(true);
  };

  const openEditCard = (cardId: string, columnId: string) => {
    const column = activeBoard.columns.find(c => c.id === columnId);
    if (!column) return;
    const card = column.cards.find(c => c.id === cardId) || null;
    if (!card) return;
    setEditingCard(card);
    setSelectedColumnId(columnId);
    setShowCreateCard(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.colorIndicator, { backgroundColor: activeBoard.color }]} />
            <View>
              <Text style={styles.title}>{activeBoard.title}</Text>
              {activeBoard.description && (
                <Text style={styles.description}>{activeBoard.description}</Text>
              )}
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addColumnButton}
              onPress={() => {
                setColumnModalMode('create');
                setColumnTitleInput('');
                setShowColumnModal(true);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
            >
              <Plus size={20} color={colors.primary[600]} strokeWidth={2} />
              <Text style={styles.addColumnText}>Add Column</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.neutral[600]} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <CardDragProvider onMoveCard={handleMoveCard}>
          <>
            <ScrollView
              horizontal
              style={styles.boardContainer}
              contentContainerStyle={[styles.boardContent, { alignItems: 'flex-start' }]}
              showsHorizontalScrollIndicator={false}
            >
              {activeBoard.columns.map((column, idx) => (
                <DraggableKanbanColumn
                  key={column.id}
                  column={column}
                  onMoveCard={handleMoveCard}
                  onAddCard={() => openCreateCard(column.id)}
                  onReorderCards={(cards: KanbanCard[]) => onReorderColumnCards(activeBoard.id, column.id, cards)}
                  onRenameColumn={handleRenameColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onEditCard={openEditCard}
                  containerStyle={{ width: colWidthPx, marginRight: idx === activeBoard.columns.length - 1 ? 16 : GAP }}
                />
              ))}
            </ScrollView>
            <DragPreview />
          </>
        </CardDragProvider>

        {/* Floating add-card button: always starts in the far-left column */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (!activeBoard.columns || activeBoard.columns.length === 0) {
              // No columns yet - open create column modal
              setColumnModalMode('create');
              setColumnTitleInput('');
              setShowColumnModal(true);
              return;
            }
            openCreateCard(activeBoard.columns[0].id);
          }}
          accessibilityRole="button"
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        <CreateCardModal
          visible={showCreateCard}
          columnId={selectedColumnId}
          boardId={activeBoard.id}
          onClose={() => { setShowCreateCard(false); setEditingCard(null); }}
          onCreate={handleCreateCard}
          initialCard={editingCard}
          columns={activeBoard.columns}
          onUpdate={async (card: any) => {
            // Support delete marker from modal
            if (card && (card as any).__delete) {
              // call deleteCard with boardId, columnId, cardId
              if (editingCard) {
                await onDeleteCard(activeBoard.id, editingCard.columnId, editingCard.id);
              }
              setEditingCard(null);
              setShowCreateCard(false);
              return;
            }
            await handleUpdateCard(card as any);
          }}
        />

        <Modal visible={showColumnModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{columnModalMode === 'create' ? 'Create Column' : 'Rename Column'}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowColumnModal(false)}>
                <X size={24} color={colors.neutral[600]} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 24 }}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={columnTitleInput}
                onChangeText={setColumnTitleInput}
                placeholder="Column title"
                placeholderTextColor={colors.neutral[400]}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowColumnModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => columnModalMode === 'create' ? handleCreateColumn(columnTitleInput) : confirmRenameColumn()}
                >
                  <Text style={styles.createButtonText}>{columnModalMode === 'create' ? 'Create' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  description: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  boardContainer: {
    flex: 1,
  },
  boardContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addColumnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
    gap: 6,
  },
  addColumnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dragPreview: {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
});