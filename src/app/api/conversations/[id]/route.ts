import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * PATCH /api/conversations/:id
 * Update conversation title and lock it
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
    const { title } = body;

    if (typeof title !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Update conversation with title and lock it
    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({
        title: title.trim(),
        title_locked: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error updating conversation:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    if (!conversation) {
      return NextResponse.json(
        { ok: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: { conversation } });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Conversation update error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/:id
 * Soft delete: set deleted_at = now(). Does not hard delete.
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

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single();

    if (error) {
      console.error('Error soft-deleting conversation:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    if (!conversation) {
      return NextResponse.json(
        { ok: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversation delete error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
