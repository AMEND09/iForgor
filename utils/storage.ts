import AsyncStorage from '@react-native-async-storage/async-storage';
import { KanbanBoard } from '@/types';

const BOARDS_KEY = '@kanban_boards';

export const storageUtils = {
  async getBoards(): Promise<KanbanBoard[]> {
    try {
      const boards = await AsyncStorage.getItem(BOARDS_KEY);
      return boards ? JSON.parse(boards) : [];
    } catch (error) {
      console.error('Error loading boards:', error);
      return [];
    }
  },

  async saveBoards(boards: KanbanBoard[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
    } catch (error) {
      console.error('Error saving boards:', error);
    }
  },

  async addBoard(board: KanbanBoard): Promise<void> {
    const boards = await this.getBoards();
    boards.push(board);
    await this.saveBoards(boards);
  },

  async updateBoard(updatedBoard: KanbanBoard): Promise<void> {
    const boards = await this.getBoards();
    const index = boards.findIndex(b => b.id === updatedBoard.id);
    if (index !== -1) {
      boards[index] = updatedBoard;
      await this.saveBoards(boards);
    }
  },

  async deleteBoard(boardId: string): Promise<void> {
    const boards = await this.getBoards();
    const filteredBoards = boards.filter(b => b.id !== boardId);
    await this.saveBoards(filteredBoards);
  }
};