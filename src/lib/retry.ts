import { lazy, type ComponentType } from 'react';

/**
 * Retry wrapper for dynamic imports. Transient network failures on lazy chunks
 * (flaky proxies, edge hiccups) otherwise crash the whole tree; a short retry
 * makes them self-heal.
 */
export async function importWithRetry<T>(factory: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await factory();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

export function lazyWithRetry(factory: () => Promise<{ default: ComponentType }>) {
  return lazy(() => importWithRetry(factory));
}
