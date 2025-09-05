/**
 * Promise utilities for better error handling and debugging
 */

export interface PromiseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Safely execute a promise and handle rejections gracefully
 */
export async function safePromise<T>(
  promise: Promise<T>,
  fallbackValue?: T
): Promise<PromiseResult<T>> {
  try {
    const data = await promise;
    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error occurred";

    console.warn("Promise rejected safely:", errorMessage);

    return {
      success: false,
      error: errorMessage,
      data: fallbackValue,
    };
  }
}

/**
 * Execute multiple promises and collect results, not failing if some reject
 */
export async function safePromiseAll<T>(
  promises: Promise<T>[]
): Promise<PromiseResult<T>[]> {
  return Promise.allSettled(promises).then((results) =>
    results.map((result, index) => {
      if (result.status === "fulfilled") {
        return {
          success: true,
          data: result.value,
        };
      } else {
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);

        console.warn(`Promise ${index} rejected safely:`, errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    })
  );
}

/**
 * Add a timeout to a promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Operation timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Retry a promise with exponential backoff
 */
export async function retryPromise<T>(
  promiseFactory: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await promiseFactory();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        lastError.message
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
