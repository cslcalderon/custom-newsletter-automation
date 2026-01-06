import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Draft } from "../../../types/draft";

const DRAFTS_DIR = path.join(process.cwd(), "data", "drafts");

// GET /api/automation/drafts/:id - Get specific draft
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(DRAFTS_DIR, `${params.id}.json`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const draft = JSON.parse(content) as Draft;
      return NextResponse.json(draft);
    } catch (fileError) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error reading draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to read draft" },
      { status: 500 }
    );
  }
}

// PUT /api/automation/drafts/:id - Update draft
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(DRAFTS_DIR, `${params.id}.json`);

    try {
      const existingContent = await fs.readFile(filePath, "utf-8");
      const existingDraft = JSON.parse(existingContent) as Draft;

      const body = await request.json();
      const { title, content, status, metadata } = body;

      const updatedDraft: Draft = {
        ...existingDraft,
        title: title || existingDraft.title,
        content: content || existingDraft.content,
        status: status || existingDraft.status,
        metadata: metadata || existingDraft.metadata,
        reviewedAt:
          status && status !== existingDraft.status
            ? new Date().toISOString()
            : existingDraft.reviewedAt,
      };

      await fs.writeFile(filePath, JSON.stringify(updatedDraft, null, 2));

      return NextResponse.json(updatedDraft);
    } catch (fileError) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update draft" },
      { status: 500 }
    );
  }
}

// DELETE /api/automation/drafts/:id - Delete draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(DRAFTS_DIR, `${params.id}.json`);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (fileError) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete draft" },
      { status: 500 }
    );
  }
}

