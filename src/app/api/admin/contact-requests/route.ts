import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTACT_LOG_FILE = path.join(DATA_DIR, "contact-requests.json");

export async function GET() {
  try {
    if (!fs.existsSync(CONTACT_LOG_FILE)) {
      return NextResponse.json([]);
    }
    const content = fs.readFileSync(CONTACT_LOG_FILE, "utf-8");
    const data = content ? JSON.parse(content) : [];
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to read contact requests:", err);
    return NextResponse.json(
      { error: "Failed to load contact requests" },
      { status: 500 },
    );
  }
}

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
