import React, { createContext, useContext, useState, ReactNode } from 'react';
import { KanbanCard, KanbanColumn } from '@/types';

interface CardDragContextType {
  draggedCard: KanbanCard | null;
  draggedFromColumn: string | null;
  isDragging: boolean;
  hoverColumnId: string | null;
  startDrag: (card: KanbanCard, fromColumnId: string) => void;
  endDrag: () => void;
  dropCard: (toColumnId: string) => void;
  setHoverColumn: (columnId: string | null) => void;
  onMoveCard?: (cardId: string, fromColumnId: string, toColumnId: string) => void;
}

const CardDragContext = createContext<CardDragContextType | undefined>(undefined);

interface CardDragProviderProps {
  children: ReactNode;
  onMoveCard?: (cardId: string, fromColumnId: string, toColumnId: string) => void;
}

export const CardDragProvider: React.FC<CardDragProviderProps> = ({ 
  children, 
  onMoveCard 
}) => {
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);

  const startDrag = (card: KanbanCard, fromColumnId: string) => {
    setDraggedCard(card);
    setDraggedFromColumn(fromColumnId);
    setIsDragging(true);
  };

  const endDrag = () => {
    setDraggedCard(null);
    setDraggedFromColumn(null);
    setIsDragging(false);
  setHoverColumnId(null);
  };

  const dropCard = (toColumnId: string) => {
    if (draggedCard && draggedFromColumn && draggedFromColumn !== toColumnId) {
      onMoveCard?.(draggedCard.id, draggedFromColumn, toColumnId);
    }
    endDrag();
  };

  return (
    <CardDragContext.Provider value={{
      draggedCard,
      draggedFromColumn,
      isDragging,
  hoverColumnId,
      startDrag,
      endDrag,
      dropCard,
  setHoverColumn: setHoverColumnId,
      onMoveCard
    }}>
      {children}
    </CardDragContext.Provider>
  );
};

export const useCardDrag = () => {
  const context = useContext(CardDragContext);
  if (context === undefined) {
    throw new Error('useCardDrag must be used within a CardDragProvider');
  }
  return context;
};
