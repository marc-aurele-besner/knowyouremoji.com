import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllEmojis } from '@/lib/emoji-data';
import type { Emoji } from '@/types/emoji';

// This route writes to the filesystem, so it requires the Node.js runtime.
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const emoji: Emoji = await request.json();

    // Validate required fields
    if (!emoji.slug || !emoji.character || !emoji.name) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, character, name' },
        { status: 400 }
      );
    }

    // Check if emoji already exists
    const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
    const filePath = path.join(emojisDir, `${emoji.slug}.json`);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Emoji with this slug already exists' }, { status: 409 });
    }

    // Write the emoji file
    fs.writeFileSync(filePath, JSON.stringify(emoji, null, 2), 'utf-8');

    return NextResponse.json({ success: true, emoji }, { status: 201 });
  } catch (error) {
    console.error('Error creating emoji:', error);
    return NextResponse.json({ error: 'Failed to create emoji' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Reuse the static data loader instead of scanning the emojis directory at
    // request time. The loader resolves JSON at build time (no fs.readdirSync
    // here), which keeps the bundler from emitting "overly broad patterns"
    // warnings for this route.
    const emojis = getAllEmojis();

    return NextResponse.json({ emojis });
  } catch (error) {
    console.error('Error fetching emojis:', error);
    return NextResponse.json({ error: 'Failed to fetch emojis' }, { status: 500 });
  }
}
