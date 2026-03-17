import { create } from 'zustand';

interface ToolState {
  currentToolId: string | null;
  searchQuery: string;
  setCurrentTool: (toolId: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  currentToolId: null,
  searchQuery: '',
  setCurrentTool: (toolId) => set({ currentToolId: toolId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
