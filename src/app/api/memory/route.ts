import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * GET /api/memory
 * List active memory items sorted by updated_at desc
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Please sign in' },
        { status: 401 }
      );
    }

    const { data: items, error } = await supabase
      .from('memory_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error fetching memory items:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { items: items || [] } });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Memory fetch error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memory
 * Create a new memory item
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value, source = 'explicit_confirmed' } = body;

    if (!key || !value || typeof key !== 'string' || typeof value !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from('memory_items')
      .insert({
        user_id: user.id,
        key: key.trim(),
        value: value.trim(),
        source,
        confidence: 100,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error creating memory item:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { item } }, { status: 201 });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Memory create error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
