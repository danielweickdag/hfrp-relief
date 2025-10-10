import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Ensure Node.js runtime so child_process is available
export const runtime = "nodejs";

function resolveScriptPath() {
  // Turbopack can complain about server-relative imports; use CWD-based resolution consistently.
  return path.resolve(process.cwd(), "automation-scheduler.js");
}

type SchedulerAction = "start" | "stop" | "status";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({ action: "status" }));
    const action: SchedulerAction = (body?.action as SchedulerAction) || "status";

    switch (action) {
      case "start": {
        // Start scheduler as a detached background process
        const scriptPath = resolveScriptPath();
        const child = spawn("node", [scriptPath, "start"], {
          cwd: process.cwd(),
          detached: true,
          stdio: "ignore",
        });
        child.unref();
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
    const scriptPath = resolveScriptPath();
    const child = spawn("node", [scriptPath, command], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: process.cwd(),
    });

    let output = "";
    let error = "";

    child.stdout?.on("data", (data) => {
      output += data.toString();
    });

    child.stderr?.on("data", (data) => {
      error += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        // status prints JSON; stop prints logs/string
        try {
          const parsed = JSON.parse(output);
          resolve({ success: true, action: command, status: parsed });
        } catch {
          resolve({ success: true, action: command, output });
        }
      } else {
        reject(new Error(error || `Scheduler command '${command}' failed with code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });

    // Safety timeout: 90s
    setTimeout(() => {
      try { child.kill(); } catch {}
      reject(new Error("Scheduler command timeout"));
    }, 90000);
  });
}