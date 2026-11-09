import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "data");

async function getStoragePath(key: string): Promise<string> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (e) {
    // Ignore if directory already exists
  }
  return path.join(STORAGE_DIR, `${key}.json`);
}

export async function getFromStorage(key: string, defaultValue = ""): Promise<string> {
  try {
    const filePath = await getStoragePath(key);
    const data = await fs.readFile(filePath, "utf-8");
    return data || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

export async function setToStorage(key: string, value: string): Promise<void> {
  try {
    const filePath = await getStoragePath(key);
    await fs.writeFile(filePath, value, "utf-8");
  } catch (error) {
    console.error(`Failed to write to storage key ${key}:`, error);
  }
}
