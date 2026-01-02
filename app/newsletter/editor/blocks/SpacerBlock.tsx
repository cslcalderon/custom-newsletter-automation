"use client";

import type { SpacerBlock as SpacerBlockType } from "../types/newsletter";

interface SpacerBlockProps {
  block: SpacerBlockType;
  isSelected: boolean;
  onClick: () => void;
}

export function SpacerBlock({ block, isSelected, onClick }: SpacerBlockProps) {
  const style: React.CSSProperties = {
    height: `${block.height || 20}px`,
    backgroundColor: isSelected ? "#e3f2fd" : "transparent",
    border: isSelected ? "2px solid #2196f3" : "2px dashed #ddd",
    position: "relative",
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-all"
      style={style}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
          Spacer: {block.height}px
        </div>
      )}
    </div>
  );
}

