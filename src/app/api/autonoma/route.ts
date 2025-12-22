import { type NextRequest, NextResponse } from "next/server";
import { autonomaClient, isAutonomaConfigured } from "@/lib/autonoma";

export async function GET(req: NextRequest) {
  try {
    if (!isAutonomaConfigured()) {
      return NextResponse.json(
        { error: "Autonoma is not configured" },
        { status: 503 }
      );
    }

    // Verify connection
    const status = await autonomaClient.verifyConnection();

    return NextResponse.json({
      configured: true,
      status: "active",
      connection: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Autonoma API Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Autonoma", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAutonomaConfigured()) {
      return NextResponse.json(
        { error: "Autonoma is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json();
    
    // Example: Proxying a request to Autonoma
    // You would typically define specific actions here
    // const result = await autonomaClient.request("/some-action", {
    //   method: "POST",
    //   body: JSON.stringify(body),
    // });

    return NextResponse.json({
      success: true,
      message: "Request received",
      data: body, // Echo back for now
    });
  } catch (error: any) {
    console.error("Autonoma API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
