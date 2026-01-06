import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Draft } from "../../types/draft";

const DRAFTS_DIR = path.join(process.cwd(), "data", "drafts");

async function ensureDraftsDir() {
  try {
    await fs.access(DRAFTS_DIR);
  } catch {
    await fs.mkdir(DRAFTS_DIR, { recursive: true });
  }
}

// GET /api/automation/drafts - Get all drafts
export async function GET(request: NextRequest) {
  try {
    await ensureDraftsDir();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const files = await fs.readdir(DRAFTS_DIR);
    const drafts: Draft[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(DRAFTS_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        const draft = JSON.parse(content) as Draft;

        // Filter by status if provided
        if (status && draft.status !== status) {
          continue;
        }

        // Filter by type if provided
        if (type && draft.type !== type) {
          continue;
        }

        drafts.push(draft);
      }
    }

    // Sort by generatedAt descending (newest first)
    drafts.sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );

    return NextResponse.json(drafts);
  } catch (error: any) {
    console.error("Error reading drafts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to read drafts" },
      { status: 500 }
    );
  }
}

// POST /api/automation/drafts - Create a new draft
export async function POST(request: NextRequest) {
  try {
    await ensureDraftsDir();

    const body = await request.json();
    const { type, title, content, metadata } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, content" },
        { status: 400 }
      );
    }

    const draft: Draft = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      content,
      status: "pending",
      generatedAt: new Date().toISOString(),
      metadata: metadata || {
        trends: [],
        relevanceScore: 0,
      },
    };

    const filePath = path.join(DRAFTS_DIR, `${draft.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(draft, null, 2));

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}

