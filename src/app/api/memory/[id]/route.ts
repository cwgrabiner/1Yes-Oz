import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * PATCH /api/memory/:id
 * Edit memory item key/value
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value } = body;

    const updates: { key?: string; value?: string } = {};
    if (key !== undefined) {
      if (typeof key !== 'string') {
        return NextResponse.json(
          { ok: false, error: 'Invalid input' },
          { status: 400 }
        );
      }
      updates.key = key.trim();
    }
    if (value !== undefined) {
      if (typeof value !== 'string') {
        return NextResponse.json(
          { ok: false, error: 'Invalid input' },
          { status: 400 }
        );
      }
      updates.value = value.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from('memory_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error updating memory item:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    if (!item) {
      return NextResponse.json(
        { ok: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: { item } });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Memory update error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memory/:id
 * Soft delete memory item (set status='deleted')
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Please sign in' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('memory_items')
      .update({ status: 'deleted' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error deleting memory item:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Memory delete error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
