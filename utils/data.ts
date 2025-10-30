import { KanbanBoard, KanbanColumn, KanbanCard, CalendarEvent } from '@/types';
import { colors, boardColors } from './colors';
import { normalizeDateString, parseDateValue, toDateKey } from '@/utils/date';

const createFutureDate = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return toDateKey(date);
};

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
            dueDate: createFutureDate(3),
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
            dueDate: createFutureDate(7),
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
        const normalizedDueDate = normalizeDateString(card.dueDate);
        if (normalizedDueDate) {
          events.push({
            id: `event-${card.id}`,
            title: card.title,
            date: normalizedDueDate,
            boardTitle: board.title,
            cardId: card.id,
            priority: card.priority,
          });
        }
      });
    });
  });
  
  return events.sort((a, b) => {
    const dateA = parseDateValue(a.date);
    const dateB = parseDateValue(b.date);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });
};