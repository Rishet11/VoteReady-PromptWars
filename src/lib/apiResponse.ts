import { NextResponse } from 'next/server';

export const apiResponse = {
  ok: <T>(data: T, headers?: Record<string, string>) =>
    NextResponse.json(data, { status: 200, ...(headers ? { headers } : {}) }),

  badRequest: (message: string, headers?: Record<string, string>) =>
    NextResponse.json({ error: message }, { status: 400, ...(headers ? { headers } : {}) }),

  notFound: (message: string, headers?: Record<string, string>) =>
    NextResponse.json({ error: message }, { status: 404, ...(headers ? { headers } : {}) }),

  serverError: (message: string, headers?: Record<string, string>) =>
    NextResponse.json({ error: message }, { status: 500, ...(headers ? { headers } : {}) }),
};
