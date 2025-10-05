import { NextResponse } from "next/server";

export async function GET() {
  try {
    const status = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "unknown",
      services: {
        email: {
          configured: !!process.env.RESEND_API_KEY,
          provider: process.env.EMAIL_SERVICE || "none",
        },
        donations: {
          testMode: process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true",
          campaign:
            process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN ||
            process.env.NEXT_PUBLIC_STRIPE_CAMPAIGN_ID ||
            "none",
        },
        analytics: {
          configured: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        },
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
