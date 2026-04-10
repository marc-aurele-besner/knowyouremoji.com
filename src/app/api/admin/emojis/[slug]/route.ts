import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Emoji } from '@/types/emoji';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
    const filePath = path.join(emojisDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Emoji not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const emoji = JSON.parse(content) as Emoji;

    return NextResponse.json({ emoji });
  } catch (error) {
    console.error('Error fetching emoji:', error);
    return NextResponse.json({ error: 'Failed to fetch emoji' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const emoji: Emoji = await request.json();

    const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
    const filePath = path.join(emojisDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Emoji not found' }, { status: 404 });
    }

    fs.writeFileSync(filePath, JSON.stringify(emoji, null, 2), 'utf-8');

    return NextResponse.json({ success: true, emoji });
  } catch (error) {
    console.error('Error updating emoji:', error);
    return NextResponse.json({ error: 'Failed to update emoji' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
    const filePath = path.join(emojisDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Emoji not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting emoji:', error);
    return NextResponse.json({ error: 'Failed to delete emoji' }, { status: 500 });
  }
}
