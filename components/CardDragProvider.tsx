import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { LayoutRectangle } from 'react-native';
import { KanbanCard } from '@/types';

interface DragPosition {
  x: number;
  y: number;
}

interface DragOffset {
  x: number;
  y: number;
}

interface DragSize {
  width: number;
  height: number;
}

interface DragStartMeta {
  offset?: DragOffset;
  size?: DragSize;
}

interface CardDragContextType {
  draggedCard: KanbanCard | null;
  draggedFromColumn: string | null;
  isDragging: boolean;
  hoverColumnId: string | null;
  dragPosition: DragPosition | null;
  dragOffset: DragOffset | null;
  dragCardSize: DragSize | null;
  startDrag: (card: KanbanCard, fromColumnId: string, meta?: DragStartMeta) => void;
  endDrag: () => void;
  dropCard: (preferredColumnId?: string | null) => void;
  updateDragPosition: (x: number, y: number) => void;
  registerColumn: (columnId: string, layout: LayoutRectangle) => void;
  unregisterColumn: (columnId: string) => void;
  onMoveCard?: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string
  ) => void | Promise<void>;
}

const CardDragContext = createContext<CardDragContextType | undefined>(undefined);

interface CardDragProviderProps {
  children: ReactNode;
  onMoveCard?: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string
  ) => void | Promise<void>;
}

export const CardDragProvider: React.FC<CardDragProviderProps> = ({
  children,
  onMoveCard,
}) => {
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset | null>(null);
  const [dragCardSize, setDragCardSize] = useState<DragSize | null>(null);

  const columnsLayoutRef = useRef<Record<string, LayoutRectangle>>({});

  const registerColumn = useCallback((columnId: string, layout: LayoutRectangle) => {
    columnsLayoutRef.current = {
      ...columnsLayoutRef.current,
      [columnId]: layout,
    };
  }, []);

  const unregisterColumn = useCallback((columnId: string) => {
    const { [columnId]: _removed, ...rest } = columnsLayoutRef.current;
    columnsLayoutRef.current = rest;
  }, []);

  const updateHoverByPosition = useCallback((x: number, y: number) => {
    const entries = Object.entries(columnsLayoutRef.current);
    const hoveredEntry = entries.find(([, layout]) => {
      const withinX = x >= layout.x && x <= layout.x + layout.width;
      const withinY = y >= layout.y && y <= layout.y + layout.height;
      return withinX && withinY;
    });
    setHoverColumnId(hoveredEntry ? hoveredEntry[0] : null);
  }, []);

  const startDrag = useCallback(
    (card: KanbanCard, fromColumnId: string, meta?: DragStartMeta) => {
      setDraggedCard(card);
      setDraggedFromColumn(fromColumnId);
      setIsDragging(true);
      setHoverColumnId(null);
      if (meta?.offset) {
        setDragOffset(meta.offset);
      } else {
        setDragOffset(null);
      }
      if (meta?.size) {
        setDragCardSize(meta.size);
      } else {
        setDragCardSize(null);
      }
    },
    []
  );

  const endDrag = useCallback(() => {
    setDraggedCard(null);
    setDraggedFromColumn(null);
    setIsDragging(false);
    setHoverColumnId(null);
    setDragPosition(null);
    setDragOffset(null);
    setDragCardSize(null);
  }, []);

  const updateDragPosition = useCallback(
    (x: number, y: number) => {
      setDragPosition({ x, y });
      updateHoverByPosition(x, y);
    },
    [updateHoverByPosition]
  );

  const dropCard = useCallback(
    (preferredColumnId?: string | null) => {
      const targetColumn = preferredColumnId ?? hoverColumnId;
      if (
        draggedCard &&
        draggedFromColumn &&
        targetColumn &&
        draggedFromColumn !== targetColumn
      ) {
        onMoveCard?.(draggedCard.id, draggedFromColumn, targetColumn);
      }
      endDrag();
    },
    [draggedCard, draggedFromColumn, hoverColumnId, onMoveCard, endDrag]
  );

  return (
    <CardDragContext.Provider
      value={{
        draggedCard,
        draggedFromColumn,
        isDragging,
        hoverColumnId,
        dragPosition,
        dragOffset,
        dragCardSize,
        startDrag,
        endDrag,
        dropCard,
        updateDragPosition,
        registerColumn,
        unregisterColumn,
        onMoveCard,
      }}
    >
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
