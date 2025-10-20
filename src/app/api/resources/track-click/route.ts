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

    const { data: latest, error: selectErr } = await supabase
      .from('resource_displays')
      .select('display_id')
      .eq('resource_id', resourceId)
      .eq('session_id', sessionId)
      .is('clicked_at', null)
      .order('displayed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectErr) {
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
    }
    if (!latest) {
      return NextResponse.json({ error: 'No pending click found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('resource_displays')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('display_id', latest.display_id);

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