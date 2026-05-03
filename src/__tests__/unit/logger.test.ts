import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger utility', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('logs info messages as structured JSON', () => {
    logger.info({ message: 'test info', context: 'test' });
    expect(consoleSpy).toHaveBeenCalled();
    const output = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(output.severity).toBe('INFO');
    expect(output.message).toBe('test info');
  });

  it('logs error messages as structured JSON', () => {
    logger.error({ message: 'test error' });
    expect(consoleSpy).toHaveBeenCalled();
    const output = JSON.parse(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]);
    expect(output.severity).toBe('ERROR');
    expect(output.message).toBe('test error');
  });

  it('logs warn messages as structured JSON', () => {
    logger.warn({ message: 'test warn' });
    expect(consoleSpy).toHaveBeenCalled();
    const output = JSON.parse(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]);
    expect(output.severity).toBe('WARN');
    expect(output.message).toBe('test warn');
  });
});
