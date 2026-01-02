import { NextRequest, NextResponse } from "next/server";
import type { NewsletterTemplate } from "@/app/newsletter/editor/types/newsletter";
import { promises as fs } from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "data", "templates");

// Ensure templates directory exists
async function ensureTemplatesDir() {
  try {
    await fs.access(TEMPLATES_DIR);
  } catch {
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
  }
}

// GET /api/templates - Get all templates
export async function GET() {
  try {
    await ensureTemplatesDir();

    const files = await fs.readdir(TEMPLATES_DIR);
    const templates: NewsletterTemplate[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(TEMPLATES_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        const template = JSON.parse(content) as NewsletterTemplate;
        templates.push(template);
      }
    }

    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Error reading templates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to read templates" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Save a new template
export async function POST(request: NextRequest) {
  try {
    await ensureTemplatesDir();

    const body = await request.json();
    const { name, description, blocks } = body;

    if (!name || !blocks) {
      return NextResponse.json(
        { error: "Missing required fields: name, blocks" },
        { status: 400 }
      );
    }

    const template: NewsletterTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || "",
      blocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const filePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(template, null, 2));

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("Error saving template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save template" },
      { status: 500 }
    );
  }
}

// PUT /api/templates - Update an existing template
export async function PUT(request: NextRequest) {
  try {
    await ensureTemplatesDir();

    const body = await request.json();
    const { id, name, description, blocks } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing template id" }, { status: 400 });
    }

    const filePath = path.join(TEMPLATES_DIR, `${id}.json`);

    try {
      const existingContent = await fs.readFile(filePath, "utf-8");
      const existingTemplate = JSON.parse(existingContent) as NewsletterTemplate;

      const updatedTemplate: NewsletterTemplate = {
        ...existingTemplate,
        name: name || existingTemplate.name,
        description: description !== undefined ? description : existingTemplate.description,
        blocks: blocks || existingTemplate.blocks,
        updatedAt: new Date().toISOString(),
      };

      await fs.writeFile(filePath, JSON.stringify(updatedTemplate, null, 2));

      return NextResponse.json(updatedTemplate);
    } catch (fileError) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates?id=xxx - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing template id" }, { status: 400 });
    }

    const filePath = path.join(TEMPLATES_DIR, `${id}.json`);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (fileError) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}

