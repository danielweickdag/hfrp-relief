
// Browser-safe storage using localStorage

export async function getFromStorage(key: string, defaultValue = ""): Promise<string> {
  try {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    }
  } catch (error) {
    console.error(`Failed to read from localStorage key ${key}:`, error);
  }
  return defaultValue;
}

export async function setToStorage(key: string, value: string): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Failed to write to localStorage key ${key}:`, error);
  }
}
