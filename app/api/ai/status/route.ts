import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/ai/status
 * Returns whether the server has an OpenAI API key configured.
 * The client uses this to decide whether to show the "add your key" UI.
 * The actual key is never exposed.
 */
export async function GET() {
  const hasServerKey = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({ hasServerKey }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
