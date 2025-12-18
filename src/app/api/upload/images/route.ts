import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const UPLOAD_DIR_REL = "uploads/blog";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", UPLOAD_DIR_REL);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/${UPLOAD_DIR_REL}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), "public", UPLOAD_DIR_REL);
    
    if (!existsSync(uploadDir)) {
       return NextResponse.json({ images: [] });
    }

    const files = await readdir(uploadDir);
    
    // Filter for image files
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        name: file,
        url: `/${UPLOAD_DIR_REL}/${file}`,
        // You could add creation time if you use stat
      }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 },
    );
  }
}
