import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Draft } from "../../../../types/draft";
import type { NewsletterBlock } from "@/app/newsletter/editor/types/newsletter";

const DRAFTS_DIR = path.join(process.cwd(), "data", "drafts");

// POST /api/automation/drafts/:id/publish - Publish a draft
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(DRAFTS_DIR, `${params.id}.json`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const draft = JSON.parse(content) as Draft;

      if (draft.status !== "approved") {
        return NextResponse.json(
          { error: "Draft must be approved before publishing" },
          { status: 400 }
        );
      }

      // Update draft status to published
      const updatedDraft: Draft = {
        ...draft,
        status: "published",
        publishedAt: new Date().toISOString(),
      };

      await fs.writeFile(filePath, JSON.stringify(updatedDraft, null, 2));

      // Return the draft data for the frontend to use
      if (draft.type === "newsletter") {
        // Parse newsletter blocks
        const blocks: NewsletterBlock[] = JSON.parse(draft.content);
        return NextResponse.json({
          success: true,
          draft: updatedDraft,
          blocks,
          subject: draft.metadata.subject,
        });
      } else {
        // Return blog post content
        return NextResponse.json({
          success: true,
          draft: updatedDraft,
          title: draft.title,
          excerpt: draft.metadata.excerpt,
          content: draft.content, // Markdown
        });
      }
    } catch (fileError) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error publishing draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish draft" },
      { status: 500 }
    );
  }
}

