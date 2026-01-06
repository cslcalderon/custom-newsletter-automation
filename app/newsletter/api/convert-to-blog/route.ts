import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Draft } from "@/app/automation/types/draft";
import type { NewsletterBlock } from "@/app/newsletter/editor/types/newsletter";

const DRAFTS_DIR = path.join(process.cwd(), "data", "drafts");

async function ensureDraftsDir() {
  try {
    await fs.access(DRAFTS_DIR);
  } catch {
    await fs.mkdir(DRAFTS_DIR, { recursive: true });
  }
}

// Convert newsletter blocks to markdown blog post
function convertNewsletterToMarkdown(blocks: NewsletterBlock[]): string {
  let markdown = "";

  for (const block of blocks) {
    switch (block.type) {
      case "header":
        const headerPrefix = "#".repeat(block.level || 1);
        markdown += `${headerPrefix} ${block.text}\n\n`;
        break;

      case "text":
        // Convert HTML to markdown, preserving structure
        let textContent = block.content
          // Convert lists
          .replace(/<ul[^>]*>/g, "")
          .replace(/<\/ul>/g, "\n")
          .replace(/<li[^>]*>/g, "- ")
          .replace(/<\/li>/g, "\n")
          // Convert paragraphs
          .replace(/<p[^>]*>/g, "")
          .replace(/<\/p>/g, "\n\n")
          // Convert divs
          .replace(/<div[^>]*>/g, "")
          .replace(/<\/div>/g, "\n\n")
          // Convert strong/bold
          .replace(/<strong[^>]*>/g, "**")
          .replace(/<\/strong>/g, "**")
          // Convert emphasis/italic
          .replace(/<em[^>]*>/g, "*")
          .replace(/<\/em>/g, "*")
          // Convert links
          .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, "[$2]($1)")
          // Convert line breaks
          .replace(/<br\s*\/?>/g, "\n")
          // Remove inline styles (they're in the HTML but not needed in markdown)
          .replace(/style="[^"]*"/g, "")
          // Clean up extra whitespace
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        
        // Clean up color spans and other inline formatting
        textContent = textContent
          .replace(/<span[^>]*>/g, "")
          .replace(/<\/span>/g, "")
          .replace(/\n{3,}/g, "\n\n");
        
        markdown += `${textContent}\n\n`;
        break;

      case "image":
        if (block.src && block.src !== "" && !block.src.includes("placeholder")) {
          markdown += `![${block.alt || ""}](${block.src})\n\n`;
        }
        break;

      case "button":
        if (block.link) {
          markdown += `[${block.text}](${block.link})\n\n`;
        }
        break;

      case "divider":
        markdown += "---\n\n";
        break;

      case "spacer":
        markdown += "\n";
        break;
    }
  }

  return markdown.trim();
}

// POST /api/convert-to-blog - Convert newsletter to blog post
export async function POST(request: NextRequest) {
  try {
    await ensureDraftsDir();

    const body = await request.json();
    const { newsletterId, title } = body;

    if (!newsletterId) {
      return NextResponse.json(
        { error: "Missing required field: newsletterId" },
        { status: 400 }
      );
    }

    // Find the newsletter draft
    const newsletterPath = path.join(DRAFTS_DIR, `${newsletterId}.json`);
    let newsletterDraft: Draft;

    try {
      const content = await fs.readFile(newsletterPath, "utf-8");
      newsletterDraft = JSON.parse(content) as Draft;
    } catch (fileError) {
      return NextResponse.json({ error: "Newsletter draft not found" }, { status: 404 });
    }

    if (newsletterDraft.type !== "newsletter") {
      return NextResponse.json(
        { error: "Draft is not a newsletter" },
        { status: 400 }
      );
    }

    // Convert newsletter blocks to markdown
    const blocks: NewsletterBlock[] = JSON.parse(newsletterDraft.content);
    const markdownContent = convertNewsletterToMarkdown(blocks);

    // Create blog post draft
    const blogDraft: Draft = {
      id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "blog",
      title: title || newsletterDraft.title || "Blog Post",
      content: markdownContent,
      status: "pending",
      generatedAt: new Date().toISOString(),
      metadata: {
        ...newsletterDraft.metadata,
        convertedFrom: newsletterId,
        convertedAt: new Date().toISOString(),
      },
    };

    // Save blog draft
    const blogPath = path.join(DRAFTS_DIR, `${blogDraft.id}.json`);
    await fs.writeFile(blogPath, JSON.stringify(blogDraft, null, 2));

    return NextResponse.json(blogDraft);
  } catch (error: any) {
    console.error("Error converting to blog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert newsletter to blog post" },
      { status: 500 }
    );
  }
}

