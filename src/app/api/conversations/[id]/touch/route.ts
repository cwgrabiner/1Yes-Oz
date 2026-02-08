import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * POST /api/conversations/:id/touch
 * Updates conversation updated_at to now(). No body parameters.
 * Call after any message is sent in the conversation.
 */
export async function POST(
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
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select('id, updated_at')
      .single();

    if (error) {
      console.error('Error touching conversation:', error);
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

    return NextResponse.json({ id: conversation.id, updated_at: conversation.updated_at });
  } catch (error) {
    console.error('Conversation touch error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
