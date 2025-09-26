import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: "Test automation is temporarily unavailable",
    message: "This feature is currently disabled during maintenance"
  }, { status: 503 });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: "Test automation is temporarily unavailable",
    message: "This feature is currently disabled during maintenance"
  }, { status: 503 });
}