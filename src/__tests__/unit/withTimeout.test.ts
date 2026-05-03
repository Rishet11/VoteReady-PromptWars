import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withTimeout } from '@/lib/withTimeout';

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves when promise settles before deadline', async () => {
    const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 100));
    
    const timeoutPromise = withTimeout(promise, 500);
    
    await vi.advanceTimersByTimeAsync(150);
    
    await expect(timeoutPromise).resolves.toBe('success');
  });

  it('rejects with descriptive error including label and ms', async () => {
    const neverResolves = new Promise(() => {});
    const timeoutPromise = withTimeout(neverResolves, 500, 'CustomTask');
    const catchPromise = timeoutPromise.catch(e => e);
    
    vi.advanceTimersByTime(600);
    
    const error = await catchPromise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('CustomTask timed out after 500ms');
  });

  it('uses default label if none is provided', async () => {
    const neverResolves = new Promise(() => {});
    const timeoutPromise = withTimeout(neverResolves, 500);
    const catchPromise = timeoutPromise.catch(e => e);
    
    vi.advanceTimersByTime(600);
    
    const error = await catchPromise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Operation timed out after 500ms');
  });
});
