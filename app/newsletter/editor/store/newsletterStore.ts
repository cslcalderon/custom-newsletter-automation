import { create } from "zustand";
import type {
  NewsletterBlock,
  NewsletterTemplate,
  NewsletterEditorState,
} from "../types/newsletter";

interface NewsletterStore extends NewsletterEditorState {
  setBlocks: (blocks: NewsletterBlock[]) => void;
  addBlock: (block: NewsletterBlock) => void;
  updateBlock: (id: string, updates: Partial<NewsletterBlock>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setSelectedBlockId: (id: string | null) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  setCurrentTemplate: (template: NewsletterTemplate | null) => void;
  loadTemplate: (template: NewsletterTemplate) => void;
  reset: () => void;
}

const initialState: NewsletterEditorState = {
  blocks: [],
  selectedBlockId: null,
  isPreviewMode: false,
  currentTemplate: null,
};

export const useNewsletterStore = create<NewsletterStore>((set) => ({
  ...initialState,

  setBlocks: (blocks) => set({ blocks }),

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block],
    })),

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    })),

  deleteBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlockId:
        state.selectedBlockId === id ? null : state.selectedBlockId,
    })),

  moveBlock: (fromIndex, toIndex) =>
    set((state) => {
      const newBlocks = [...state.blocks];
      const [removed] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, removed);
      return { blocks: newBlocks };
    }),

  setSelectedBlockId: (id) => set({ selectedBlockId: id }),

  setIsPreviewMode: (isPreview) => set({ isPreviewMode: isPreview }),

  setCurrentTemplate: (template) => set({ currentTemplate: template }),

  loadTemplate: (template) =>
    set({
      blocks: template.blocks,
      currentTemplate: template,
      selectedBlockId: null,
    }),

  reset: () => set(initialState),
}));

