import { describe, it, expect } from 'bun:test';
import Image, { alt, size, contentType } from '@/app/opengraph-image';

describe('opengraph-image', () => {
  it('exports correct alt text', () => {
    expect(alt).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
  });

  it('exports correct size', () => {
    expect(size).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it('exports correct content type', () => {
    expect(contentType).toBe('image/png');
  });

  it('returns an ImageResponse', () => {
    const response = Image();
    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Response);
  });

  it('has correct content type header', () => {
    const response = Image();
    expect(response.headers.get('content-type')).toBe('image/png');
  });
});
