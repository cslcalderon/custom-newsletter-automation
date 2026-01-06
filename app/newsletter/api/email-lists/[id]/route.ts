import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { EmailList } from "@/app/newsletter/editor/types/emailList";

const EMAIL_LISTS_DIR = path.join(process.cwd(), "data", "email-lists");

// GET /api/email-lists/:id - Get specific email list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(EMAIL_LISTS_DIR, `${params.id}.json`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const emailList = JSON.parse(content) as EmailList;
      return NextResponse.json(emailList);
    } catch (fileError) {
      return NextResponse.json({ error: "Email list not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error reading email list:", error);
    return NextResponse.json(
      { error: error.message || "Failed to read email list" },
      { status: 500 }
    );
  }
}

// PUT /api/email-lists/:id - Update email list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(EMAIL_LISTS_DIR, `${params.id}.json`);

    try {
      const existingContent = await fs.readFile(filePath, "utf-8");
      const existingList = JSON.parse(existingContent) as EmailList;

      const body = await request.json();
      const { name, emails } = body;

      const updatedList: EmailList = {
        ...existingList,
        name: name || existingList.name,
        emails: emails
          ? emails.filter((email: string) => email && email.includes("@"))
          : existingList.emails,
        updatedAt: new Date().toISOString(),
      };

      await fs.writeFile(filePath, JSON.stringify(updatedList, null, 2));

      return NextResponse.json(updatedList);
    } catch (fileError) {
      return NextResponse.json({ error: "Email list not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error updating email list:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update email list" },
      { status: 500 }
    );
  }
}

// DELETE /api/email-lists/:id - Delete email list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(EMAIL_LISTS_DIR, `${params.id}.json`);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (fileError) {
      return NextResponse.json({ error: "Email list not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error deleting email list:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete email list" },
      { status: 500 }
    );
  }
}

