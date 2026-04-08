import { describe, it, expect, mock } from 'bun:test';
import { encodeInterpretation } from '@/lib/share-encoding';
import { createInterpretationResult } from '../../../utils';

// Mock next/og ImageResponse
mock.module('next/og', () => ({
  ImageResponse: class MockImageResponse extends Response {
    constructor(
      _element: React.ReactElement,
      options?: { width?: number; height?: number; headers?: Record<string, string> }
    ) {
      const headers = new Headers(options?.headers);
      headers.set('content-type', 'image/png');
      super('mock-image-data', { headers });
    }
  },
}));

// Import after mocks
const { GET } = await import('@/app/og/interpretation/route');

// Create a valid encoded interpretation for testing
const mockResult = createInterpretationResult({
  message: 'Hey thanks so much for your help 😊🙏',
  interpretation:
    'This message expresses genuine gratitude with warm emoji reinforcement. The combination of the smiling face and prayer hands suggests sincere appreciation.',
  metrics: {
    overallTone: 'positive',
    sarcasmProbability: 5,
    passiveAggressionProbability: 2,
    confidence: 92,
  },
});

const validEncoded = encodeInterpretation(mockResult);

describe('Interpretation OG Image Route', () => {
  it('returns 400 when no r parameter is provided', async () => {
    const request = new Request('http://localhost/og/interpretation');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe('Missing interpretation data');
  });

  it('returns 400 for invalid encoded data', async () => {
    const request = new Request('http://localhost/og/interpretation?r=invalid-base64-garbage');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe('Invalid interpretation data');
  });

  it('returns image response for valid interpretation data', async () => {
    const request = new Request(`http://localhost/og/interpretation?r=${validEncoded}`);
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('sets cache-control header', async () => {
    const request = new Request(`http://localhost/og/interpretation?r=${validEncoded}`);
    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600');
  });

  it('handles negative tone interpretation', async () => {
    const negativeResult = createInterpretationResult({
      message: 'Oh great, another meeting 🙄',
      interpretation: 'Heavy sarcasm detected. The eye-roll emoji confirms frustration.',
      metrics: {
        overallTone: 'negative',
        sarcasmProbability: 85,
        passiveAggressionProbability: 60,
        confidence: 88,
      },
    });
    const encoded = encodeInterpretation(negativeResult);
    const request = new Request(`http://localhost/og/interpretation?r=${encoded}`);
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('handles neutral tone interpretation', async () => {
    const neutralResult = createInterpretationResult({
      message: 'See you at 3pm 👍',
      interpretation: 'Simple acknowledgement with a thumbs up.',
      metrics: {
        overallTone: 'neutral',
        sarcasmProbability: 10,
        passiveAggressionProbability: 5,
        confidence: 95,
      },
    });
    const encoded = encodeInterpretation(neutralResult);
    const request = new Request(`http://localhost/og/interpretation?r=${encoded}`);
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('handles long message and interpretation text', async () => {
    const longResult = createInterpretationResult({
      message: 'A'.repeat(200),
      interpretation: 'B'.repeat(500),
      metrics: {
        overallTone: 'positive',
        sarcasmProbability: 0,
        passiveAggressionProbability: 0,
        confidence: 50,
      },
    });
    const encoded = encodeInterpretation(longResult);
    const request = new Request(`http://localhost/og/interpretation?r=${encoded}`);
    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});
