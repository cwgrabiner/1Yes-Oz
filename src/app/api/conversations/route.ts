import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * POST /api/conversations
 * Create a new conversation
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

    // Ensure user exists in public.users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email ?? null,
      }, {
        onConflict: 'id',
      });

    if (userError) {
      console.error('Error upserting user:', userError);
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: null,
        title_locked: false,
      })
      .select()
      .single();

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { conversationId: conversation.id } }, { status: 201 });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Conversation creation error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations
 * List user conversations sorted by updated_at desc
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

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { conversations: conversations || [] } });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Conversation fetch error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
