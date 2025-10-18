// src/app/api/resources/track-click/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { resourceId, sessionId } = await req.json();

    if (!resourceId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('resource_displays')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('resource_id', resourceId)
      .eq('session_id', sessionId)
      .is('clicked_at', null) // Only update if not already clicked
      .order('displayed_at', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}