import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const settingsFilePath = path.join(process.cwd(), 'data', 'admin-settings.json');

// Function to read settings from the JSON file
async function getSettings() {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return default settings
    return {
      tabs: { overview: true, automation: true, analytics: true, content: true, gallery: true, settings: true, stripe: true, videos: true },
      socialIcons: { facebook: true, instagram: true, twitter: true, youtube: true, tiktok: true },
    };
  }
}

// GET handler to retrieve current settings
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

// POST handler to update settings
export async function POST(req: Request) {
  const newSettings = await req.json();
  const currentSettings = await getSettings();

  // Merge the new settings with the current settings
  const updatedSettings = { ...currentSettings, ...newSettings };

  try {
    await fs.writeFile(settingsFilePath, JSON.stringify(updatedSettings, null, 2));
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
  }
}
