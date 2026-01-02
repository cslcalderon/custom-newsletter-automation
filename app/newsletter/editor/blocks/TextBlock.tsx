"use client";

import type { TextBlock as TextBlockType } from "../types/newsletter";
import { Link as LinkIcon } from "lucide-react";

interface TextBlockProps {
  block: TextBlockType;
  isSelected: boolean;
  onClick: () => void;
}

export function TextBlock({ block, isSelected, onClick }: TextBlockProps) {
  const style: React.CSSProperties = {
    fontSize: block.fontSize || 16,
    fontFamily: block.fontFamily || "Arial, sans-serif",
    color: block.color || "#000000",
    backgroundColor: block.backgroundColor || "transparent",
    textAlign: block.textAlign || "left",
    padding: block.padding !== undefined ? `${block.padding}px` : "10px",
  };

  const linkStyle: React.CSSProperties = {
    color: block.color || "#0000EE",
    textDecoration: "underline",
  };

  const content = block.content || "Click to edit text";
  const hasLink = block.link && block.link.trim() !== "";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-2 transition-all relative ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-transparent hover:border-gray-300"
      }`}
      style={style}
    >
      {hasLink && (
        <div className="absolute top-2 right-2 opacity-50">
          <LinkIcon className="w-3 h-3" />
        </div>
      )}
      {hasLink ? (
        <a
          href={block.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={linkStyle}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </a>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </div>
  );
}

