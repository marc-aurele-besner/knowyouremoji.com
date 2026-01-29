import { describe, it, expect } from 'bun:test';
import Icon, { size, contentType } from '@/app/icon';

describe('icon', () => {
  it('exports correct size', () => {
    expect(size).toEqual({
      width: 32,
      height: 32,
    });
  });

  it('exports correct content type', () => {
    expect(contentType).toBe('image/png');
  });

  it('returns an ImageResponse', () => {
    const response = Icon();
    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Response);
  });

  it('has correct content type header', () => {
    const response = Icon();
    expect(response.headers.get('content-type')).toBe('image/png');
  });
});
