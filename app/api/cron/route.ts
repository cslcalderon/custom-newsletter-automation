import { NextRequest, NextResponse } from "next/server";
import { runDailyAutomation } from "@/lib/automation/scheduler";

// This endpoint can be called by external cron services (like Vercel Cron)
// or used for manual triggering
export async function GET(request: NextRequest) {
  try {
    // Check for authorization header (optional, for security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run automation
    await runDailyAutomation();

    return NextResponse.json({
      success: true,
      message: "Automation completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error running cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to run automation",
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}

