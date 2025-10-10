import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

type WorkflowType = "development" | "staging" | "production" | "maintenance";
type WorkflowOptions = {
  continueOnError?: boolean;
  verbose?: boolean;
};
type TaskResult = {
  name: string;
  success: boolean;
  timestamp: string;
};

export async function POST(request: NextRequest) {
  try {
    // Safely parse request body and apply explicit types
    const rawBody = (await request.json().catch(() => ({}))) as Partial<{
      workflowType: WorkflowType;
      options: WorkflowOptions;
    }>;
    const workflowType = rawBody.workflowType;
    const options: WorkflowOptions = rawBody.options ?? {};

    if (!workflowType) {
      return NextResponse.json(
        { error: "Workflow type is required" },
        { status: 400 }
      );
    }

    // Validate workflow type
    const allowedWorkflows: WorkflowType[] = [
      "development",
      "staging",
      "production",
      "maintenance",
    ];
    if (!allowedWorkflows.includes(workflowType)) {
      return NextResponse.json(
        {
          error: `Invalid workflow type. Allowed: ${allowedWorkflows.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Execute the workflow orchestrator
    const result = await executeWorkflow(workflowType, options);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Workflow execution error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to execute workflow", details },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return available workflows and their status
    const status = await getWorkflowStatus();
    return NextResponse.json(status);
  } catch (error: unknown) {
    console.error("Status fetch error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch workflow status", details },
      { status: 500 }
    );
  }
}

async function executeWorkflow(
  workflowType: WorkflowType,
  options: WorkflowOptions = {}
) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "workflow-orchestrator.js");
    const args = [workflowType];

    if (options.continueOnError) {
      args.push("--continue-on-error");
    }

    if (options.verbose) {
      args.push("--verbose");
    }

    const child = spawn("node", [scriptPath, ...args], {
      stdio: ["inherit", "pipe", "pipe"],
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
      try {
        // Try to parse the output as JSON (workflow results)
        const result = JSON.parse(output || "{}");

        if (code === 0) {
          resolve({
            success: true,
            workflowType,
            result,
            output,
          });
        } else {
          resolve({
            success: false,
            workflowType,
            error: error || `Workflow exited with code ${code}`,
            output,
          });
        }
      } catch (parseError) {
        // If output isn't JSON, return as text
        if (code === 0) {
          resolve({
            success: true,
            workflowType,
            output,
            tasks: parseTasksFromOutput(output),
          });
        } else {
          reject(new Error(error || `Workflow exited with code ${code}`));
        }
      }
    });

    child.on("error", (err) => {
      reject(err);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      child.kill();
      reject(new Error("Workflow timeout"));
    }, 300000);
  });
}

async function getWorkflowStatus() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "workflow-orchestrator.js");

    const child = spawn("node", [scriptPath, "status"], {
      stdio: ["inherit", "pipe", "pipe"],
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
        try {
          const status = JSON.parse(output);
          resolve({
            status,
            workflows: {
              development: {
                available: true,
                description: "Test and build workflow",
              },
              staging: {
                available: true,
                description: "Deploy to staging environment",
              },
              production: {
                available: true,
                description: "Deploy to production environment",
              },
              maintenance: {
                available: true,
                description: "System maintenance and cleanup",
              },
            },
          });
        } catch (parseError) {
          resolve({
            status: { message: "Status unavailable" },
            workflows: {
              development: {
                available: true,
                description: "Test and build workflow",
              },
              staging: {
                available: true,
                description: "Deploy to staging environment",
              },
              production: {
                available: true,
                description: "Deploy to production environment",
              },
              maintenance: {
                available: true,
                description: "System maintenance and cleanup",
              },
            },
          });
        }
      } else {
        reject(new Error(error || `Status check failed with code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

function parseTasksFromOutput(output: string): TaskResult[] {
  // Simple parser to extract task information from output
  const tasks: TaskResult[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    if (line.includes("✅") || line.includes("❌")) {
      const isSuccess = line.includes("✅");
      const taskName = line
        .replace(/.*(?:✅|❌)\s*/, "")
        .replace(/\s*-.*$/, "")
        .trim();

      if (taskName) {
        tasks.push({
          name: taskName,
          success: isSuccess,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return tasks;
}
