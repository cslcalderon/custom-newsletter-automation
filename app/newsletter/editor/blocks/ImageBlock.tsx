"use client";

import type { ImageBlock as ImageBlockType } from "../types/newsletter";
import { Link as LinkIcon } from "lucide-react";

interface ImageBlockProps {
  block: ImageBlockType;
  isSelected: boolean;
  onClick: () => void;
}

export function ImageBlock({ block, isSelected, onClick }: ImageBlockProps) {
  const style: React.CSSProperties = {
    textAlign: block.align || "center",
    padding: block.padding !== undefined ? `${block.padding}px` : "10px",
  };

  const imageStyle: React.CSSProperties = {
    width: block.width ? `${block.width}px` : "100%",
    height: block.height ? `${block.height}px` : "auto",
    maxWidth: "100%",
  };

  const hasLink = block.link && block.link.trim() !== "" && block.link !== "#";
  const hasImage = block.src && block.src.trim() !== "";

  const imageElement = hasImage ? (
    <img
      src={block.src}
      alt={block.alt || ""}
      style={imageStyle}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ddd' width='400' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";
      }}
    />
  ) : (
    <div
      className="flex items-center justify-center bg-gray-100 text-gray-400"
      style={{ minHeight: "200px", ...imageStyle }}
    >
      Click to add image
    </div>
  );

  const content = hasLink ? (
    <a
      href={block.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{ display: "inline-block" }}
    >
      {imageElement}
    </a>
  ) : (
    imageElement
  );

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
      {content}
    </div>
  );
}

