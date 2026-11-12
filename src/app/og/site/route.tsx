import { ImageResponse } from 'next/og';

/**
 * Default social card for the site (og:image / twitter:image).
 *
 * Replaces the square `/logo.png`, which share previews cropped into a
 * blurry close-up of the thinking face. This renders a proper 1200 × 630
 * card in the brand palette (stone + amber, see `globals.css`): headline,
 * one-line pitch, and a grid of the emojis people most often misread.
 */

/** Emojis whose "real" meaning differs most from the Unicode name. */
const TILE_EMOJIS = ['💀', '🙂', '😭', '👍', '🫠', '🔥'] as const;

const HEADLINE_WORDS = ['Decode', 'what', 'emojis', 'really', 'mean'] as const;

const COLORS = {
  background: '#0c0a09',
  tile: '#1c1917',
  tileBorder: '#292524',
  text: '#fafaf9',
  muted: '#a8a29e',
  accent: '#f59e0b',
  accentSoft: 'rgba(245, 158, 11, 0.14)',
} as const;

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '64px 72px',
        backgroundColor: COLORS.background,
        backgroundImage:
          'radial-gradient(circle at 85% 20%, rgba(245, 158, 11, 0.22) 0%, rgba(12, 10, 9, 0) 55%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: 600,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 12,
            padding: '10px 20px',
            borderRadius: 999,
            backgroundColor: COLORS.accentSoft,
            color: COLORS.accent,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          <span style={{ display: 'flex', fontSize: 30 }}>🤔</span>
          KnowYourEmoji
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: COLORS.text,
            }}
          >
            {HEADLINE_WORDS.map((word) => (
              <span
                key={word}
                style={{
                  marginRight: 18,
                  color: word === 'really' ? COLORS.accent : COLORS.text,
                }}
              >
                {word}
              </span>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 24,
              fontSize: 30,
              lineHeight: 1.35,
              color: COLORS.muted,
            }}
          >
            Real meanings by context, generation and platform, plus an AI message interpreter.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: COLORS.muted }}>
          knowyouremoji.com
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: 432,
          gap: 24,
          transform: 'rotate(-6deg)',
        }}
      >
        {TILE_EMOJIS.map((emoji) => (
          <div
            key={emoji}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 128,
              height: 128,
              borderRadius: 30,
              backgroundColor: COLORS.tile,
              border: `2px solid ${COLORS.tileBorder}`,
              fontSize: 76,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
