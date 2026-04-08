import { ImageResponse } from 'next/og';
import { decodeInterpretation } from '@/lib/share-encoding';

export const runtime = 'edge';

function getToneColor(tone: 'positive' | 'neutral' | 'negative'): string {
  switch (tone) {
    case 'positive':
      return '#22c55e';
    case 'negative':
      return '#ef4444';
    case 'neutral':
      return '#6b7280';
  }
}

function getToneEmoji(tone: 'positive' | 'neutral' | 'negative'): string {
  switch (tone) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😬';
    case 'neutral':
      return '😐';
  }
}

function getMetricColor(value: number): string {
  if (value >= 70) return '#ef4444';
  if (value >= 40) return '#eab308';
  return '#22c55e';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get('r');

  if (!encoded) {
    return new Response('Missing interpretation data', { status: 400 });
  }

  const data = decodeInterpretation(encoded);

  if (!data) {
    return new Response('Invalid interpretation data', { status: 400 });
  }

  const toneColor = getToneColor(data.tone);
  const toneEmoji = getToneEmoji(data.tone);
  const truncatedMessage =
    data.message.length > 80 ? data.message.slice(0, 77) + '...' : data.message;
  const truncatedInterpretation =
    data.interpretation.length > 200
      ? data.interpretation.slice(0, 197) + '...'
      : data.interpretation;

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        fontFamily: 'sans-serif',
        padding: '40px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: 'white', display: 'flex' }}>
            🔍 Emoji Interpretation
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 20,
            backgroundColor: toneColor,
            color: 'white',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {toneEmoji} {data.tone.charAt(0).toUpperCase() + data.tone.slice(1)}
        </div>
      </div>

      {/* Original message */}
      <div
        style={{
          display: 'flex',
          padding: '16px 20px',
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.6)', display: 'flex' }}>
          &ldquo;{truncatedMessage}&rdquo;
        </div>
      </div>

      {/* Interpretation */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          padding: '20px 24px',
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderLeft: `6px solid ${toneColor}`,
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: '#1f2937',
            lineHeight: 1.5,
            display: 'flex',
          }}
        >
          {truncatedInterpretation}
        </div>
      </div>

      {/* Metrics bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)', display: 'flex' }}>
              Sarcasm
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: getMetricColor(data.sarcasm),
                display: 'flex',
              }}
            >
              {data.sarcasm}%
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)', display: 'flex' }}>
              Passive-Aggression
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: getMetricColor(data.passiveAggression),
                display: 'flex',
              }}
            >
              {data.passiveAggression}%
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)', display: 'flex' }}>
              Confidence
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'white',
                display: 'flex',
              }}
            >
              {data.confidence}%
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
          }}
        >
          KnowYourEmoji.com
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    }
  );
}
