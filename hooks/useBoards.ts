import { useState, useEffect, useCallback } from 'react';
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/types';
import { storageUtils } from '@/utils/storage';

type BoardsUpdater = (boards: KanbanBoard[]) => KanbanBoard[];

const cloneColumn = (column: KanbanColumn): KanbanColumn => ({
  ...column,
  cards: column.cards.map(card => ({ ...card })),
});

const cloneBoard = (board: KanbanBoard): KanbanBoard => ({
  ...board,
  columns: board.columns.map(cloneColumn),
});

export const useBoards = () => {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  const applyUpdate = useCallback(async (updater: BoardsUpdater) => {
    let nextBoards: KanbanBoard[] = [];
    setBoards(prev => {
      nextBoards = updater(prev.map(cloneBoard));
      return nextBoards;
    });
    try {
      await storageUtils.saveBoards(nextBoards);
    } catch (error) {
      console.error('Error saving boards:', error);
    }
  }, []);

  const loadBoards = async () => {
    try {
      const savedBoards = await storageUtils.getBoards();
      setBoards((savedBoards || []).map(cloneBoard));
    } catch (error) {
      console.error('Error loading boards:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const addBoard = async (board: KanbanBoard) => {
    await applyUpdate(prev => [...prev, cloneBoard(board)]);
  };

  const updateBoard = async (updatedBoard: KanbanBoard) => {
    await applyUpdate(prev => prev.map(board => (
      board.id === updatedBoard.id ? cloneBoard(updatedBoard) : board
    )));
  };

  const deleteBoard = async (boardId: string) => {
    await applyUpdate(prev => prev.filter(board => board.id !== boardId));
  };

  const addColumn = async (boardId: string, column: KanbanColumn) => {
    await applyUpdate(prev => prev.map(board => (
      board.id === boardId
        ? {
            ...board,
            columns: [...board.columns, cloneColumn(column)],
          }
        : board
    )));
  };

  const updateColumn = async (boardId: string, column: KanbanColumn) => {
    await applyUpdate(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      return {
        ...board,
        columns: board.columns.map(col => {
          if (col.id !== column.id) return col;
          // If the incoming column payload doesn't include cards (e.g. a rename), keep existing cards
          const newCards = column.cards ? column.cards.map(card => ({ ...card })) : col.cards.map(card => ({ ...card }));
          return { ...col, ...column, cards: newCards };
        }),
      };
    }));
  };

  const deleteColumn = async (boardId: string, columnId: string) => {
    await applyUpdate(prev => prev.map(board => (
      board.id === boardId
        ? {
            ...board,
            columns: board.columns.filter(column => column.id !== columnId),
          }
        : board
    )));
  };

  const reorderColumns = async (boardId: string, columns: KanbanColumn[]) => {
    await applyUpdate(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      return {
        ...board,
        columns: columns.map((column, index) => ({
          ...column,
          order: index,
          cards: column.cards.map(card => ({ ...card })),
        })),
      };
    }));
  };

  const reorderColumnCards = async (boardId: string, columnId: string, cards: KanbanCard[]) => {
    await applyUpdate(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      return {
        ...board,
        columns: board.columns.map(column => (
          column.id === columnId
            ? { ...column, cards: cards.map(card => ({ ...card, columnId })) }
            : column
        )),
      };
    }));
  };

  const addCard = async (boardId: string, columnId: string, card: KanbanCard) => {
    await applyUpdate(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      const targetColumn = board.columns.find(column => column.id === columnId);
      if (!targetColumn) {
        return board;
      }
      return {
        ...board,
        columns: board.columns.map(column => (
          column.id === columnId
            ? { ...column, cards: [...column.cards, { ...card, columnId }] }
            : column
        )),
      };
    }));
  };

  const updateCard = async (boardId: string, columnId: string, card: KanbanCard) => {
    await applyUpdate(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      const targetExists = board.columns.some(column => column.id === columnId);
      if (!targetExists) {
        return board;
      }
      return {
        ...board,
        columns: board.columns.map(column => {
          if (column.id === columnId) {
            return {
              ...column,
              cards: column.cards.map(existing =>
                existing.id === card.id ? { ...existing, ...card, columnId } : existing
              ),
            };
          }
          // If the card moved to a new column, ensure it is removed from its old column
          return {
            ...column,
            cards: column.cards.filter(existing => existing.id !== card.id),
          };
        }),
      };
    }));
  };

  const deleteCard = async (boardId: string, columnId: string, cardId: string) => {
    await applyUpdate(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      return {
        ...board,
        columns: board.columns.map(column => (
          column.id === columnId
            ? { ...column, cards: column.cards.filter(card => card.id !== cardId) }
            : column
        )),
      };
    }));
  };

  const moveCard = async (cardId: string, fromColumnId: string, toColumnId: string, boardId: string) => {
    if (fromColumnId === toColumnId) return;
    await applyUpdate(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      const hasDestination = board.columns.some(column => column.id === toColumnId);
      if (!hasDestination) {
        return board;
      }

      let movedCard: KanbanCard | null = null;

      const updatedColumns = board.columns.map(column => {
        if (column.id === fromColumnId) {
          const remainingCards = column.cards.filter(card => {
            if (card.id === cardId) {
              movedCard = { ...card, columnId: toColumnId };
              return false;
            }
            return true;
          });
          return { ...column, cards: remainingCards };
        }
        return { ...column };
      }).map(column => {
        if (column.id === toColumnId && movedCard) {
          return { ...column, cards: [...column.cards, movedCard!] };
        }
        return column;
      });

      return { ...board, columns: updatedColumns };
    }));
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
    reorderColumnCards,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    refreshBoards: loadBoards,
  };
};