import { ImageResponse } from 'next/og';
import { getComboBySlug } from '@/lib/combo-data';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  // Remove .png extension if present
  const cleanSlug = slug.replace(/\.png$/, '');
  const combo = getComboBySlug(cleanSlug);

  if (!combo) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        fontFamily: 'sans-serif',
        padding: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <div style={{ fontSize: 140, lineHeight: 1, display: 'flex' }}>{combo.combo}</div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: 'white',
            marginTop: 20,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          {combo.name}
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: 16,
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
            display: 'flex',
          }}
        >
          {combo.meaning.length > 120 ? combo.meaning.slice(0, 117) + '...' : combo.meaning}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            padding: '8px 20px',
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: 18,
          }}
        >
          {combo.category}
        </div>
      </div>
      <div
        style={{
          fontSize: 20,
          color: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
        }}
      >
        KnowYourEmoji.com
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
