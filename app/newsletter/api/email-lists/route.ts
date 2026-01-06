import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { EmailList } from "@/app/newsletter/editor/types/emailList";

const EMAIL_LISTS_DIR = path.join(process.cwd(), "data", "email-lists");

async function ensureEmailListsDir() {
  try {
    await fs.access(EMAIL_LISTS_DIR);
  } catch {
    await fs.mkdir(EMAIL_LISTS_DIR, { recursive: true });
  }
}

// GET /api/email-lists - Get all email lists
export async function GET() {
  try {
    await ensureEmailListsDir();

    const files = await fs.readdir(EMAIL_LISTS_DIR);
    const emailLists: EmailList[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(EMAIL_LISTS_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        const emailList = JSON.parse(content) as EmailList;
        emailLists.push(emailList);
      }
    }

    return NextResponse.json(emailLists);
  } catch (error: any) {
    console.error("Error reading email lists:", error);
    return NextResponse.json(
      { error: error.message || "Failed to read email lists" },
      { status: 500 }
    );
  }
}

// POST /api/email-lists - Create a new email list
export async function POST(request: NextRequest) {
  try {
    await ensureEmailListsDir();

    const body = await request.json();
    const { name, emails } = body;

    if (!name || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "Missing required fields: name, emails (array)" },
        { status: 400 }
      );
    }

    const emailList: EmailList = {
      id: `email-list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      emails: emails.filter((email: string) => email && email.includes("@")),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const filePath = path.join(EMAIL_LISTS_DIR, `${emailList.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(emailList, null, 2));

    return NextResponse.json(emailList);
  } catch (error: any) {
    console.error("Error saving email list:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save email list" },
      { status: 500 }
    );
  }
}

