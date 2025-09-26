import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Stripe campaigns are temporarily unavailable" },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Stripe campaigns are temporarily unavailable" },
    { status: 503 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: "Stripe campaigns are temporarily unavailable" },
    { status: 503 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Stripe campaigns are temporarily unavailable" },
    { status: 503 }
  );
}
