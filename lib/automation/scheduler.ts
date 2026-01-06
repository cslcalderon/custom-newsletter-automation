import * as cron from "node-cron";
import { analyzeMarketTrends } from "@/app/automation/agents/trendAnalyzer";
import {
  generateNewsletterDraft,
  generateBlogPostDraft,
} from "@/app/automation/agents/contentGenerator";
import { promises as fs } from "fs";
import path from "path";
import type { Draft } from "@/app/automation/types/draft";

const DRAFTS_DIR = path.join(process.cwd(), "data", "drafts");

async function ensureDraftsDir() {
  try {
    await fs.access(DRAFTS_DIR);
  } catch {
    await fs.mkdir(DRAFTS_DIR, { recursive: true });
  }
}

async function saveDraft(draft: Draft) {
  await ensureDraftsDir();
  const filePath = path.join(DRAFTS_DIR, `${draft.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(draft, null, 2));
}

async function runDailyAutomation() {
  try {
    console.log("Starting daily automation...");

    // Analyze trends
    const trendAnalysis = await analyzeMarketTrends();

    // Generate newsletter draft
    const newsletterDraft = await generateNewsletterDraft(trendAnalysis);
    const newsletterDraftDoc: Draft = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "newsletter",
      title: newsletterDraft.subject,
      content: JSON.stringify(newsletterDraft.blocks),
      status: "pending",
      generatedAt: new Date().toISOString(),
      metadata: {
        trends: trendAnalysis.relevantStories.map((s) => s.title),
        relevanceScore:
          trendAnalysis.relevantStories.reduce(
            (sum, s) => sum + s.relevanceScore,
            0
          ) / trendAnalysis.relevantStories.length,
        subject: newsletterDraft.subject,
      },
    };
    await saveDraft(newsletterDraftDoc);

    // Generate blog post draft
    const blogDraft = await generateBlogPostDraft(trendAnalysis);
    const blogDraftDoc: Draft = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "blog",
      title: blogDraft.title,
      content: blogDraft.content,
      status: "pending",
      generatedAt: new Date().toISOString(),
      metadata: {
        trends: trendAnalysis.relevantStories.map((s) => s.title),
        relevanceScore:
          trendAnalysis.relevantStories.reduce(
            (sum, s) => sum + s.relevanceScore,
            0
          ) / trendAnalysis.relevantStories.length,
        excerpt: blogDraft.excerpt,
      },
    };
    await saveDraft(blogDraftDoc);

    console.log("Daily automation completed successfully");
  } catch (error) {
    console.error("Error in daily automation:", error);
  }
}

export function startScheduler() {
  // Get schedule from environment variable or default to 9 AM daily
  const schedule = process.env.AUTOMATION_SCHEDULE || "0 9 * * *";

  console.log(`Scheduling automation with cron: ${schedule}`);

  // Schedule the automation
  cron.schedule(schedule, () => {
    runDailyAutomation();
  });

  console.log("Automation scheduler started");
}

// For manual testing, export the function
export { runDailyAutomation };

