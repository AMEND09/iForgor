import { useState, useEffect } from 'react';
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/types';
import { storageUtils } from '@/utils/storage';

export const useBoards = () => {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const savedBoards = await storageUtils.getBoards();
      setBoards(savedBoards || []);
    } catch (error) {
      console.error('Error loading boards:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const addBoard = async (board: KanbanBoard) => {
    try {
      await storageUtils.addBoard(board);
      setBoards(prev => [...prev, board]);
    } catch (error) {
      console.error('Error adding board:', error);
    }
  };

  const updateBoard = async (updatedBoard: KanbanBoard) => {
    try {
      await storageUtils.updateBoard(updatedBoard);
      setBoards(prev => prev.map(b => b.id === updatedBoard.id ? updatedBoard : b));
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      await storageUtils.deleteBoard(boardId);
      setBoards(prev => prev.filter(b => b.id !== boardId));
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const addColumn = async (boardId: string, column: KanbanColumn) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    board.columns.push(column);
    await updateBoard(board);
  };

  const updateColumn = async (boardId: string, column: KanbanColumn) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    const idx = board.columns.findIndex(c => c.id === column.id);
    if (idx !== -1) {
      board.columns[idx] = column;
      await updateBoard(board);
    }
  };

  const deleteColumn = async (boardId: string, columnId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    board.columns = board.columns.filter(c => c.id !== columnId);
    await updateBoard(board);
  };

  const reorderColumns = async (boardId: string, columns: KanbanColumn[]) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    board.columns = columns;
    await updateBoard(board);
  };

  const moveCard = async (cardId: string, fromColumnId: string, toColumnId: string, boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const fromColumn = board.columns.find(c => c.id === fromColumnId);
    const toColumn = board.columns.find(c => c.id === toColumnId);
    
    if (!fromColumn || !toColumn) return;

    const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = fromColumn.cards[cardIndex];
    card.columnId = toColumnId;

    // Remove card from source column
    fromColumn.cards.splice(cardIndex, 1);
    
    // Add card to destination column
    toColumn.cards.push(card);

    await updateBoard(board);
  };

  const deleteCard = async (boardId: string, columnId: string, cardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    const col = board.columns.find(c => c.id === columnId);
    if (!col) return;
    col.cards = col.cards.filter(c => c.id !== cardId);
    await updateBoard(board);
  };

  return {
    boards,
    loading,
    addBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    moveCard,
  deleteCard,
    refreshBoards: loadBoards,
  };
};