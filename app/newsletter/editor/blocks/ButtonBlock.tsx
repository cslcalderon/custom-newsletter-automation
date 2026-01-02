"use client";

import type { ButtonBlock as ButtonBlockType } from "../types/newsletter";

interface ButtonBlockProps {
  block: ButtonBlockType;
  isSelected: boolean;
  onClick: () => void;
}

export function ButtonBlock({ block, isSelected, onClick }: ButtonBlockProps) {
  const style: React.CSSProperties = {
    textAlign: block.align || "center",
    padding: block.padding !== undefined ? `${block.padding}px` : "10px",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: block.backgroundColor || "#007bff",
    color: block.textColor || "#ffffff",
    fontSize: block.fontSize || 16,
    padding: "12px 24px",
    borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : "4px",
    border: "none",
    cursor: "pointer",
    display: "inline-block",
    textDecoration: "none",
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
      <a href={block.link || "#"} style={buttonStyle}>
        {block.text || "Button"}
      </a>
    </div>
  );
}

