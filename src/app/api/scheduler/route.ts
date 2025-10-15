import { type NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

// Ensure Node.js runtime so child_process is available
export const runtime = "nodejs";

// Function to get scheduler script path at runtime
function getSchedulerScriptPath() {
  return path.join(process.cwd(), "automation-scheduler.js");
}

type SchedulerAction = "start" | "stop" | "status";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({ action: "status" }));
    const action: SchedulerAction = (body?.action as SchedulerAction) || "status";

    switch (action) {
      case "start": {
        // Start scheduler as a detached background process
        const scriptPath = getSchedulerScriptPath();
        exec(`node "${scriptPath}" start`, {
          cwd: process.cwd(),
        }, (error) => {
          // Fire and forget - don't wait for completion
          if (error) {
            console.error("Scheduler start error:", error);
          }
        });
        return NextResponse.json({ success: true, message: "Scheduler start initiated" });
      }
      case "stop": {
        const result = await runSchedulerCommand("stop");
        return NextResponse.json(result);
      }
      case "status": {
        const result = await runSchedulerCommand("status");
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Scheduler API error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to process scheduler action", details },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await runSchedulerCommand("status");
    return NextResponse.json(result);
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to get scheduler status", details },
      { status: 500 }
    );
  }
}

async function runSchedulerCommand(command: SchedulerAction) {
  return new Promise((resolve, reject) => {
    const scriptPath = getSchedulerScriptPath();
    const execCommand = `node "${scriptPath}" ${command}`;
    
    exec(execCommand, {
      cwd: process.cwd(),
      timeout: 90000, // 90 second timeout
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message || `Scheduler command '${command}' failed`));
        return;
      }

      // status prints JSON; stop prints logs/string
      try {
        const parsed = JSON.parse(stdout);
        resolve({ success: true, action: command, status: parsed });
      } catch {
        resolve({ success: true, action: command, output: stdout });
      }
    });
  });
}