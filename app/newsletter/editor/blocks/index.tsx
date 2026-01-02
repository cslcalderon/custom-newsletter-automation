"use client";

import type { NewsletterBlock } from "../types/newsletter";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ButtonBlock } from "./ButtonBlock";
import { DividerBlock } from "./DividerBlock";
import { SpacerBlock } from "./SpacerBlock";
import { HeaderBlock } from "./HeaderBlock";

interface BlockRendererProps {
  block: NewsletterBlock;
  isSelected: boolean;
  onClick: () => void;
}

export function BlockRenderer({ block, isSelected, onClick }: BlockRendererProps) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} isSelected={isSelected} onClick={onClick} />;
    case "image":
      return <ImageBlock block={block} isSelected={isSelected} onClick={onClick} />;
    case "button":
      return <ButtonBlock block={block} isSelected={isSelected} onClick={onClick} />;
    case "divider":
      return <DividerBlock block={block} isSelected={isSelected} onClick={onClick} />;
    case "spacer":
      return <SpacerBlock block={block} isSelected={isSelected} onClick={onClick} />;
    case "header":
      return <HeaderBlock block={block} isSelected={isSelected} onClick={onClick} />;
    default:
      return null;
  }
}

