"use client";

import type { DividerBlock as DividerBlockType } from "../types/newsletter";

interface DividerBlockProps {
  block: DividerBlockType;
  isSelected: boolean;
  onClick: () => void;
}

export function DividerBlock({ block, isSelected, onClick }: DividerBlockProps) {
  const style: React.CSSProperties = {
    padding: block.padding !== undefined ? `${block.padding}px` : "10px",
  };

  const dividerStyle: React.CSSProperties = {
    borderTop: `${block.thickness || 1}px solid ${block.color || "#cccccc"}`,
    margin: 0,
    width: "100%",
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-transparent hover:border-gray-300"
      }`}
      style={style}
    >
      <hr style={dividerStyle} />
    </div>
  );
}

