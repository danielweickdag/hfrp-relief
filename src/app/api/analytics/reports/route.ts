import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Analytics reports are temporarily unavailable" },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Analytics reports are temporarily unavailable" },
    { status: 503 }
  );
}