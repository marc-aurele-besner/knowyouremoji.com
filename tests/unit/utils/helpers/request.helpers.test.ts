import { describe, it, expect } from 'bun:test';
import {
  createNextRequest,
  parseResponse,
  createHeaders,
} from '../../../utils/helpers/request.helpers';
import { NextRequest } from 'next/server';

describe('request.helpers', () => {
  describe('createNextRequest', () => {
    it('should create a POST request with JSON body by default', () => {
      const body = { message: 'test', emoji: '😀' };
      const request = createNextRequest(body);

      expect(request).toBeInstanceOf(NextRequest);
      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should allow specifying different HTTP methods', () => {
      const getRequest = createNextRequest(null, { method: 'GET' });
      const putRequest = createNextRequest({ data: 'test' }, { method: 'PUT' });
      const deleteRequest = createNextRequest(null, { method: 'DELETE' });

      expect(getRequest.method).toBe('GET');
      expect(putRequest.method).toBe('PUT');
      expect(deleteRequest.method).toBe('DELETE');
    });

    it('should allow specifying custom URL', () => {
      const request = createNextRequest({ test: true }, { url: 'https://example.com/api/custom' });

      expect(request.url).toBe('https://example.com/api/custom');
    });

    it('should allow adding custom headers', () => {
      const request = createNextRequest(
        { test: true },
        { headers: { 'X-Custom-Header': 'custom-value' } }
      );

      expect(request.headers.get('X-Custom-Header')).toBe('custom-value');
      // Should still have content-type
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should allow overriding default headers', () => {
      const request = createNextRequest(
        { test: true },
        { headers: { 'Content-Type': 'text/plain' } }
      );

      expect(request.headers.get('Content-Type')).toBe('text/plain');
    });

    it('should handle null body for GET requests', () => {
      const request = createNextRequest(null, { method: 'GET' });

      expect(request.method).toBe('GET');
    });
  });

  describe('parseResponse', () => {
    it('should parse JSON response', async () => {
      const data = { result: 'success', count: 42 };
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await parseResponse(response);

      expect(parsed).toEqual(data);
    });

    it('should handle response with nested objects', async () => {
      const data = {
        user: { name: 'test', emoji: '😀' },
        results: [1, 2, 3],
      };
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await parseResponse(response);

      expect(parsed).toEqual(data);
    });

    it('should handle empty response body', async () => {
      const response = new Response('{}', {
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await parseResponse(response);

      expect(parsed).toEqual({});
    });

    it('should handle array response', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await parseResponse(response);

      expect(parsed).toEqual(data);
    });
  });

  describe('createHeaders', () => {
    it('should create headers with default Content-Type', () => {
      const headers = createHeaders();

      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should allow adding custom headers', () => {
      const headers = createHeaders({
        'X-API-Key': 'test-key',
        Authorization: 'Bearer token',
      });

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-API-Key']).toBe('test-key');
      expect(headers['Authorization']).toBe('Bearer token');
    });

    it('should allow overriding Content-Type', () => {
      const headers = createHeaders({
        'Content-Type': 'text/plain',
      });

      expect(headers['Content-Type']).toBe('text/plain');
    });

    it('should handle empty overrides', () => {
      const headers = createHeaders({});

      expect(headers['Content-Type']).toBe('application/json');
      expect(Object.keys(headers)).toHaveLength(1);
    });
  });
});
