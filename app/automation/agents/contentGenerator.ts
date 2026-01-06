import {
  generateNewsletterContent,
  generateBlogPost,
} from "@/lib/gemini/client";
import {
  generateNewsletterContentMock,
  generateBlogPostMock,
} from "@/lib/gemini/mockClient";
import type { NewsletterBlock } from "@/app/newsletter/editor/types/newsletter";
import type { TrendAnalysisResult } from "./trendAnalyzer";
import { generateNewsletterFromStructuredData } from "./newsletterGenerator";
import type { NewsletterGenerationOptions } from "../types/newsletterStrategy";

const USE_MOCK_MODE = process.env.USE_MOCK_MODE === "true" || !process.env.GEMINI_API_KEY;

export interface NewsletterDraft {
  subject: string;
  blocks: NewsletterBlock[];
  aiReasoning?: any[];
  dataSources?: any[];
}

export interface BlogPostDraft {
  title: string;
  excerpt: string;
  content: string; // Markdown
}

export async function generateNewsletterDraft(
  trendAnalysis: TrendAnalysisResult,
  options?: NewsletterGenerationOptions
): Promise<NewsletterDraft> {
  // If we have structured data (new newsletter strategy), use it
  if (trendAnalysis.rawData) {
    const result = generateNewsletterFromStructuredData(
      trendAnalysis.rawData,
      options || { includeBiweeklyInsights: false }
    );
    return result;
  }

  // Legacy path for blog-style newsletters
  const aiContent = USE_MOCK_MODE
    ? await generateNewsletterContentMock(
        trendAnalysis.relevantStories,
        trendAnalysis.overallTrend
      )
    : await generateNewsletterContent(
        trendAnalysis.relevantStories,
        trendAnalysis.overallTrend
      );

  // Convert AI content to newsletter blocks
  const blocks: NewsletterBlock[] = [];

  // Header block
  blocks.push({
    id: `header-${Date.now()}-1`,
    type: "header",
    text: aiContent.header,
    level: 1,
    fontSize: 32,
    color: "#000000",
    textAlign: "center",
    padding: 20,
  });

  // Introduction block
  blocks.push({
    id: `text-${Date.now()}-2`,
    type: "text",
    content: `<p>${aiContent.introduction}</p>`,
    fontSize: 16,
    color: "#333333",
    textAlign: "left",
    padding: 15,
  });

  // Spacer
  blocks.push({
    id: `spacer-${Date.now()}-3`,
    type: "spacer",
    height: 20,
  });

  // Optional featured image block (placeholder)
  blocks.push({
    id: `image-${Date.now()}-featured`,
    type: "image",
    src: "",
    alt: "Featured image - click to add",
    align: "center",
    padding: 15,
  });

  // Spacer
  blocks.push({
    id: `spacer-${Date.now()}-4`,
    type: "spacer",
    height: 20,
  });

  // Divider
  blocks.push({
    id: `divider-${Date.now()}-5`,
    type: "divider",
    color: "#cccccc",
    thickness: 1,
    padding: 10,
  });

  // Content sections
  aiContent.sections.forEach((section, index) => {
    // Section header
    blocks.push({
      id: `header-${Date.now()}-${index + 6}`,
      type: "header",
      text: section.title,
      level: 2,
      fontSize: 24,
      color: "#000000",
      textAlign: "left",
      padding: 15,
    });

    // Optional section image (every other section)
    if (index % 2 === 0) {
      blocks.push({
        id: `image-${Date.now()}-${index}`,
        type: "image",
        src: "",
        alt: `Image for ${section.title} - click to add`,
        align: "center",
        padding: 10,
      });
      blocks.push({
        id: `spacer-${Date.now()}-${index}-img-spacer`,
        type: "spacer",
        height: 10,
      });
    }

    // Section content
    const paragraphs = section.content.split("\n\n").filter((p) => p.trim());
    paragraphs.forEach((paragraph) => {
      blocks.push({
        id: `text-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        type: "text",
        content: `<p>${paragraph.trim()}</p>`,
        fontSize: 16,
        color: "#333333",
        textAlign: "left",
        padding: 10,
      });
    });

    // Spacer between sections
    if (index < aiContent.sections.length - 1) {
      blocks.push({
        id: `spacer-${Date.now()}-${index}-spacer`,
        type: "spacer",
        height: 15,
      });
    }
  });

  // Conclusion
  blocks.push({
    id: `spacer-${Date.now()}-conclusion-spacer`,
    type: "spacer",
    height: 20,
  });

  blocks.push({
    id: `divider-${Date.now()}-conclusion-divider`,
    type: "divider",
    color: "#cccccc",
    thickness: 1,
    padding: 10,
  });

  blocks.push({
    id: `text-${Date.now()}-conclusion`,
    type: "text",
    content: `<p><strong>Conclusion:</strong> ${aiContent.conclusion}</p>`,
    fontSize: 16,
    color: "#333333",
    textAlign: "left",
    padding: 15,
  });

  return {
    subject: aiContent.subject,
    blocks,
  };
}

export async function generateBlogPostDraft(
  trendAnalysis: TrendAnalysisResult
): Promise<BlogPostDraft> {
  const blogPost = USE_MOCK_MODE
    ? await generateBlogPostMock(
        trendAnalysis.relevantStories,
        trendAnalysis.overallTrend
      )
    : await generateBlogPost(
        trendAnalysis.relevantStories,
        trendAnalysis.overallTrend
      );

  return {
    title: blogPost.title,
    excerpt: blogPost.excerpt,
    content: blogPost.content,
  };
}

