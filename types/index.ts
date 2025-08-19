export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  columnId: string;
  boardId: string;
  createdAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  boardId: string;
  cards: KanbanCard[];
  order: number;
}

export interface KanbanBoard {
  id: string;
  title: string;
  description?: string;
  columns: KanbanColumn[];
  createdAt: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  boardTitle: string;
  cardId: string;
  priority: 'low' | 'medium' | 'high';
}