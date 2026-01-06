export type DraftType = "newsletter" | "blog";
export type DraftStatus = "pending" | "approved" | "rejected" | "published";

import type { AIReasoning, DataSource } from "./newsletterStrategy";

export interface Draft {
  id: string;
  type: DraftType;
  title: string;
  content: string; // JSON string for newsletter blocks or markdown for blog
  status: DraftStatus;
  generatedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  metadata: {
    trends: string[];
    relevanceScore: number;
    sourceData?: any;
    subject?: string; // For newsletter drafts
    excerpt?: string; // For blog drafts
    aiReasoning?: AIReasoning[]; // AI thought process for each section
    dataSources?: DataSource[]; // All data sources used
    generationOptions?: {
      includeBiweeklyInsights: boolean;
      biweeklyTopic?: string;
    };
  };
}

