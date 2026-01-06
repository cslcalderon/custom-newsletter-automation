import { NextRequest, NextResponse } from "next/server";
import { analyzeMarketTrends } from "../../agents/trendAnalyzer";
import {
  generateNewsletterDraft,
  generateBlogPostDraft,
} from "../../agents/contentGenerator";
import type { Draft } from "../../types/draft";

// POST /api/automation/generate-draft - Generate a new draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, includeBiweeklyInsights, biweeklyTopic } = body; // 'newsletter' or 'blog'

    if (!type || (type !== "newsletter" && type !== "blog")) {
      return NextResponse.json(
        { error: "Type must be 'newsletter' or 'blog'" },
        { status: 400 }
      );
    }

    const generationOptions = {
      includeBiweeklyInsights: includeBiweeklyInsights === true,
      biweeklyTopic: biweeklyTopic || undefined,
    };

    // Step 1: Analyze trends (with generation options for newsletters)
    const trendAnalysis = await analyzeMarketTrends(
      type === "newsletter" ? generationOptions : undefined
    );

    // Step 2: Generate content based on type
    let draft: Draft;

    if (type === "newsletter") {
      const newsletterDraft = await generateNewsletterDraft(trendAnalysis, generationOptions);
      draft = {
        id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "newsletter",
        title: newsletterDraft.subject,
        content: JSON.stringify(newsletterDraft.blocks),
        status: "pending",
        generatedAt: new Date().toISOString(),
        metadata: {
          trends: trendAnalysis.relevantStories?.map((s) => s.title) || [],
          relevanceScore:
            trendAnalysis.relevantStories?.reduce(
              (sum, s) => sum + s.relevanceScore,
              0
            ) / (trendAnalysis.relevantStories?.length || 1) || 0,
          subject: newsletterDraft.subject,
          aiReasoning: newsletterDraft.aiReasoning,
          dataSources: newsletterDraft.dataSources,
          generationOptions: generationOptions,
        },
      };
    } else {
      const blogDraft = await generateBlogPostDraft(trendAnalysis, generationOptions);
      draft = {
        id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "blog",
        title: blogDraft.title,
        content: blogDraft.content, // Already in markdown format
        status: "pending",
        generatedAt: new Date().toISOString(),
        metadata: {
          trends: trendAnalysis.relevantStories?.map((s) => s.title) || [],
          relevanceScore:
            trendAnalysis.relevantStories?.reduce(
              (sum, s) => sum + s.relevanceScore,
              0
            ) / (trendAnalysis.relevantStories?.length || 1) || 0,
          excerpt: blogDraft.excerpt,
          generationOptions: generationOptions,
        },
      };
    }

    // Step 3: Save draft
    const fs = await import("fs");
    const pathModule = await import("path");
    const draftsDir = pathModule.join(process.cwd(), "data", "drafts");

    try {
      await fs.promises.access(draftsDir);
    } catch {
      await fs.promises.mkdir(draftsDir, { recursive: true });
    }

    const filePath = pathModule.join(draftsDir, `${draft.id}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(draft, null, 2));

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error("Error generating draft:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate draft",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

