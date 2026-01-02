import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: "RESEND_API_KEY is not configured. Email sending is disabled in local mode.",
          message: "To enable email sending, add RESEND_API_KEY to your .env file"
        },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

