import { KanbanBoard, KanbanColumn, KanbanCard, CalendarEvent } from '@/types';
import { colors, boardColors } from './colors';

export const createSampleBoard = (id: string, title: string, colorIndex: number): KanbanBoard => {
  const boardColor = boardColors[colorIndex % boardColors.length];
  
  return {
    id,
    title,
    description: `Sample ${title.toLowerCase()} board`,
    color: boardColor,
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: `${id}-col-1`,
        title: 'To Do',
        boardId: id,
        order: 0,
        cards: [
          {
            id: `${id}-card-1`,
            title: 'Setup project structure',
            description: 'Create the basic folder structure and components',
            priority: 'high',
            columnId: `${id}-col-1`,
            boardId: id,
            createdAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: `${id}-card-2`,
            title: 'Design wireframes',
            description: 'Create initial wireframes for the user interface',
            priority: 'medium',
            columnId: `${id}-col-1`,
            boardId: id,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: `${id}-col-2`,
        title: 'In Progress',
        boardId: id,
        order: 1,
        cards: [
          {
            id: `${id}-card-3`,
            title: 'Implement authentication',
            description: 'Add user login and registration functionality',
            priority: 'high',
            columnId: `${id}-col-2`,
            boardId: id,
            createdAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
      {
        id: `${id}-col-3`,
        title: 'Review',
        boardId: id,
        order: 2,
        cards: [],
      },
      {
        id: `${id}-col-4`,
        title: 'Done',
        boardId: id,
        order: 3,
        cards: [
          {
            id: `${id}-card-4`,
            title: 'Initial project setup',
            description: 'Setup development environment and dependencies',
            priority: 'low',
            columnId: `${id}-col-4`,
            boardId: id,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ],
  };
};

// Demo/sample boards removed. Use the app UI to create boards and columns.

export const getCalendarEvents = (boards: KanbanBoard[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  boards.forEach(board => {
    board.columns.forEach(column => {
      column.cards.forEach(card => {
        if (card.dueDate) {
          events.push({
            id: `event-${card.id}`,
            title: card.title,
            date: card.dueDate,
            boardTitle: board.title,
            cardId: card.id,
            priority: card.priority,
          });
        }
      });
    });
  });
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};