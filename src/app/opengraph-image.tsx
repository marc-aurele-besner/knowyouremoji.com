import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'KnowYourEmoji - Decode What Emojis Really Mean';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
        }}
      >
        <span style={{ fontSize: 120 }}>🤔</span>
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          marginBottom: 20,
        }}
      >
        KnowYourEmoji
      </div>
      <div
        style={{
          fontSize: 32,
          color: 'white',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          maxWidth: 800,
          textAlign: 'center',
        }}
      >
        Decode what emojis really mean in context
      </div>
    </div>,
    {
      ...size,
    }
  );
}
