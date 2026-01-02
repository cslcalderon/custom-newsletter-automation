"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Type, Image, MousePointer2, Minus, MoveVertical, Heading } from "lucide-react";
import type { BlockType } from "../types/newsletter";

interface PaletteItem {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
}

const paletteItems: PaletteItem[] = [
  { type: "header", label: "Header", icon: <Heading className="w-4 h-4" /> },
  { type: "text", label: "Text", icon: <Type className="w-4 h-4" /> },
  { type: "image", label: "Image", icon: <Image className="w-4 h-4" /> },
  { type: "button", label: "Button", icon: <MousePointer2 className="w-4 h-4" /> },
  { type: "divider", label: "Divider", icon: <Minus className="w-4 h-4" /> },
  { type: "spacer", label: "Spacer", icon: <MoveVertical className="w-4 h-4" /> },
];

function DraggablePaletteItem({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      type: item.type,
      isPaletteItem: true,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-grab
        hover:bg-gray-50 hover:border-gray-300 transition-colors
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      {item.icon}
      <span className="text-sm font-medium">{item.label}</span>
    </div>
  );
}

export function ComponentPalette() {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Components</h2>
      <div className="space-y-2">
        {paletteItems.map((item) => (
          <DraggablePaletteItem key={item.type} item={item} />
        ))}
      </div>
    </div>
  );
}

