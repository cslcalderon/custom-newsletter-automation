"use client";

import type { HeaderBlock as HeaderBlockType } from "../types/newsletter";

interface HeaderBlockProps {
  block: HeaderBlockType;
  isSelected: boolean;
  onClick: () => void;
}

export function HeaderBlock({ block, isSelected, onClick }: HeaderBlockProps) {
  const style: React.CSSProperties = {
    fontSize: block.fontSize || (block.level === 1 ? 32 : block.level === 2 ? 24 : 20),
    fontFamily: block.fontFamily || "Arial, sans-serif",
    color: block.color || "#000000",
    textAlign: block.textAlign || "left",
    padding: block.padding !== undefined ? `${block.padding}px` : "10px",
    fontWeight: "bold",
  };

  const Tag = `h${block.level || 1}` as keyof JSX.IntrinsicElements;

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
      <Tag>{block.text || "Click to edit header"}</Tag>
    </div>
  );
}

