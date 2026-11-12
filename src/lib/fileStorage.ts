
export async function getFromStorage(key: string, defaultValue = ""): Promise<string> {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const STORAGE_DIR = path.join(process.cwd(), "data");
    
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (e) {}

    const filePath = path.join(STORAGE_DIR, `${key}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return data || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

export async function setToStorage(key: string, value: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (e) {
      console.error(`Failed to write to localStorage key ${key}:`, e);
      return;
    }
  }

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const STORAGE_DIR = path.join(process.cwd(), "data");

    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (e) {}

    const filePath = path.join(STORAGE_DIR, `${key}.json`);
    await fs.writeFile(filePath, value, "utf-8");
  } catch (error) {
    console.error(`Failed to write to storage key ${key}:`, error);
  }
}
