import { describe, it, expect } from 'vitest';
import { apiResponse } from '@/lib/apiResponse';

describe('apiResponse utility', () => {
  it('creates an OK response with headers', async () => {
    const data = { success: true };
    const headers = { 'X-Test': 'test' };
    const response = apiResponse.ok(data, headers);
    
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(data);
    expect(response.headers.get('X-Test')).toBe('test');
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('creates a Bad Request response', async () => {
    const response = apiResponse.badRequest('Invalid input');
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid input');
  });

  it('creates an Internal Server Error response', async () => {
    const response = apiResponse.serverError('Something went wrong');
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Something went wrong');
  });
});
