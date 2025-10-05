import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTACT_LOG_FILE = path.join(DATA_DIR, "contact-requests.json");

// Contact record type aligned with persisted data
interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
  newsletter: boolean;
  ip: string;
  timestamp: string;
  status: "received" | "emailed";
  emailId?: string | null;
  recipients?: string[];
  cc?: string[];
  handled?: boolean;
  handledAt?: string;
  assignedTo?: string;
  adminNotes?: string;
}

type PatchBody = {
  id: string;
  handled?: boolean;
  handledAt?: string;
  assignedTo?: string;
  adminNotes?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PatchBody;
    if (!body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (!fs.existsSync(CONTACT_LOG_FILE)) {
      return NextResponse.json({ error: "No contact log file" }, { status: 404 });
    }

    const raw = fs.readFileSync(CONTACT_LOG_FILE, "utf-8");
    const list: ContactRecord[] = raw ? (JSON.parse(raw) as ContactRecord[]) : [];
    const idx = list.findIndex((r) => r.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const record: ContactRecord = list[idx];
    const updated: ContactRecord = {
      ...record,
      ...(body.handled !== undefined ? { handled: body.handled } : {}),
      ...(body.handledAt !== undefined ? { handledAt: body.handledAt } : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo } : {}),
      ...(body.adminNotes !== undefined ? { adminNotes: body.adminNotes } : {}),
    };

    list[idx] = updated;
    fs.writeFileSync(CONTACT_LOG_FILE, JSON.stringify(list, null, 2));

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update contact request:", err);
    return NextResponse.json(
      { error: "Failed to update contact request" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}