export type BlockType =
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "header";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
  link?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  padding?: number;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  link?: string;
  width?: number;
  height?: number;
  align?: "left" | "center" | "right";
  padding?: number;
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  text: string;
  link: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
  borderRadius?: number;
  align?: "left" | "center" | "right";
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  color?: string;
  thickness?: number;
  padding?: number;
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: number;
}

export interface HeaderBlock extends BaseBlock {
  type: "header";
  text: string;
  level?: 1 | 2 | 3;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  padding?: number;
}

export type NewsletterBlock =
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock
  | HeaderBlock;

export interface NewsletterTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  blocks: NewsletterBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterEditorState {
  blocks: NewsletterBlock[];
  selectedBlockId: string | null;
  isPreviewMode: boolean;
  currentTemplate: NewsletterTemplate | null;
}

