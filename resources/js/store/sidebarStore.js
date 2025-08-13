import { create } from 'zustand';

const useSidebarStore = create((set) => ({
    isOpen: true,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useSidebarStore;
