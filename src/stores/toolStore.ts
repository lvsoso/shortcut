import { create } from 'zustand';

const SIDEBAR_STORAGE_KEY = 'devtools.sidebar.open';

function readSidebarPreference() {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (storedValue === null) {
      return true;
    }

    return storedValue === 'true';
  } catch {
    return true;
  }
}

function writeSidebarPreference(isOpen: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
  } catch {
    // 本地存储失败时只跳过持久化，不影响当前会话状态。
  }
}

interface ToolState {
  currentToolId: string | null;
  searchQuery: string;
  isSidebarOpen: boolean;
  isShortcutHelpOpen: boolean;
  setCurrentTool: (toolId: string) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setShortcutHelpOpen: (isOpen: boolean) => void;
  toggleShortcutHelp: () => void;
}

export const useToolStore = create<ToolState>((set) => ({
  currentToolId: null,
  searchQuery: '',
  isSidebarOpen: readSidebarPreference(),
  isShortcutHelpOpen: false,
  setCurrentTool: (toolId) => set({ currentToolId: toolId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSidebarOpen: (isOpen) => {
    writeSidebarPreference(isOpen);
    set({ isSidebarOpen: isOpen });
  },
  toggleSidebar: () => set((state) => {
    const nextOpen = !state.isSidebarOpen;
    writeSidebarPreference(nextOpen);
    return { isSidebarOpen: nextOpen };
  }),
  setShortcutHelpOpen: (isOpen) => set({ isShortcutHelpOpen: isOpen }),
  toggleShortcutHelp: () => set((state) => ({ isShortcutHelpOpen: !state.isShortcutHelpOpen })),
}));
