/**
 * Request test helpers
 *
 * Utilities for creating and working with request/response objects in tests.
 */

import { NextRequest } from 'next/server';

export interface CreateNextRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Record<string, string>;
}

/**
 * Create a NextRequest for API route testing
 * @param body - Request body (will be JSON stringified)
 * @param options - Request options (method, url, headers)
 */
export function createNextRequest(
  body: unknown,
  options: CreateNextRequestOptions = {}
): NextRequest {
  const { method = 'POST', url = 'http://localhost:3000/api/test', headers = {} } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Build request options directly without typed RequestInit to avoid compatibility issues
  const requestOptions: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: defaultHeaders,
  };

  // Only add body for methods that support it
  if (body !== null && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestOptions);
}

/**
 * Parse JSON response from API route
 * @param response - Response object to parse
 */
export async function parseResponse<T = unknown>(response: Response): Promise<T> {
  return response.json();
}

/**
 * Create headers object with default Content-Type
 * @param overrides - Headers to add or override
 */
export function createHeaders(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...overrides,
  };
}
