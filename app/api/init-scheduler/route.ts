import { NextResponse } from "next/server";
import { startScheduler } from "@/lib/automation/scheduler";

// Initialize scheduler on server startup
// This should be called once when the server starts
let schedulerStarted = false;

export async function GET() {
  if (!schedulerStarted) {
    startScheduler();
    schedulerStarted = true;
    return NextResponse.json({
      success: true,
      message: "Scheduler started",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Scheduler already running",
  });
}

