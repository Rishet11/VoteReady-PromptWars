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

  it('creates an OK response without headers', async () => {
    const data = { success: true };
    const response = apiResponse.ok(data);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(data);
    expect(response.headers.has('X-Test')).toBe(false);
  });

  it('creates a Bad Request response', async () => {
    const response = apiResponse.badRequest('Invalid input');
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid input');
  });

  it('creates a Bad Request response with headers', async () => {
    const response = apiResponse.badRequest('Invalid input', { 'X-Test': 'test' });
    expect(response.status).toBe(400);
    expect(response.headers.get('X-Test')).toBe('test');
  });

  it('creates a Not Found response without headers', async () => {
    const response = apiResponse.notFound('Not found');
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Not found');
  });

  it('creates a Not Found response with headers', async () => {
    const response = apiResponse.notFound('Not found', { 'X-Test': 'test' });
    expect(response.status).toBe(404);
    expect(response.headers.get('X-Test')).toBe('test');
  });

  it('creates an Internal Server Error response without headers', async () => {
    const response = apiResponse.serverError('Something went wrong');
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Something went wrong');
  });

  it('creates an Internal Server Error response with headers', async () => {
    const response = apiResponse.serverError('Something went wrong', { 'X-Test': 'test' });
    expect(response.status).toBe(500);
    expect(response.headers.get('X-Test')).toBe('test');
  });
});
