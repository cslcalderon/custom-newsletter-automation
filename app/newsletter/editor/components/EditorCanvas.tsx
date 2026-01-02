"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNewsletterStore } from "../store/newsletterStore";
import { BlockRenderer } from "../blocks";
import type { NewsletterBlock } from "../types/newsletter";
import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

function SortableBlock({ block }: { block: NewsletterBlock }) {
  const { selectedBlockId, setSelectedBlockId } = useNewsletterStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 h-full w-8 cursor-grab active:cursor-grabbing flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <div className="w-1 h-12 bg-gray-300 rounded-full" />
      </div>
      <BlockRenderer
        block={block}
        isSelected={selectedBlockId === block.id}
        onClick={() => setSelectedBlockId(block.id)}
      />
    </div>
  );
}

function DroppableCanvas() {
  const { blocks } = useNewsletterStore();
  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 p-8 bg-white overflow-y-auto min-h-full"
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Drag components from the left to start building your newsletter</p>
          </div>
        ) : (
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}


export function EditorCanvas() {
  return <DroppableCanvas />;
}

export function createBlockFromType(type: string): NewsletterBlock {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  switch (type) {
    case "text":
      return {
        id,
        type: "text",
        content: "Enter your text here",
        fontSize: 16,
        color: "#000000",
        textAlign: "left",
        padding: 10,
      };
    case "image":
      return {
        id,
        type: "image",
        src: "",
        alt: "",
        align: "center",
        padding: 10,
      };
    case "button":
      return {
        id,
        type: "button",
        text: "Click me",
        link: "#",
        backgroundColor: "#007bff",
        textColor: "#ffffff",
        fontSize: 16,
        padding: 10,
        borderRadius: 4,
        align: "center",
      };
    case "divider":
      return {
        id,
        type: "divider",
        color: "#cccccc",
        thickness: 1,
        padding: 10,
      };
    case "spacer":
      return {
        id,
        type: "spacer",
        height: 20,
      };
    case "header":
      return {
        id,
        type: "header",
        text: "Header",
        level: 1,
        fontSize: 32,
        color: "#000000",
        textAlign: "left",
        padding: 10,
      };
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}

