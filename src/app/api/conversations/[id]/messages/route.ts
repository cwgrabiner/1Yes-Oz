import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { stripMemoryMarkers } from '@/lib/memory/parse';

/**
 * GET /api/conversations/:id/messages
 * List messages for a conversation sorted by created_at asc
 */
export async function GET(
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

    // Verify conversation belongs to user (RLS should handle this, but double-check)
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { ok: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Fetch messages ordered by created_at ascending
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      // TODO Phase 8: send to observability
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { messages: messages || [] } });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Message fetch error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/:id/messages
 * Insert a message and handle auto-title generation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role, content, client_msg_id } = body;

    if (!role || !content) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Strip memory markers before saving to database
    const cleanContent = stripMemoryMarkers(content);

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { ok: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Try to insert message (handles deduplication via unique constraint)
    // Use cleanContent (with markers stripped) for database storage
    const { data: insertedMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content: cleanContent,
        client_msg_id: client_msg_id || null,
      })
      .select()
      .single();

    let message = insertedMessage;

    // If unique constraint violation (duplicate client_msg_id), fetch existing message
    if (insertError && client_msg_id) {
      // Check if it's a unique constraint violation (PostgreSQL error code 23505)
      const isUniqueViolation = insertError.code === '23505' || 
                                insertError.message?.includes('duplicate key') ||
                                insertError.message?.includes('unique constraint');

      if (isUniqueViolation) {
        const { data: existingMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('client_msg_id', client_msg_id)
          .single();

        if (existingMessage) {
          message = existingMessage;
        } else {
          // TODO Phase 8: send to observability
          console.error('Error inserting message:', insertError);
          return NextResponse.json(
            { ok: false, error: 'Something went wrong. Please try again.' },
            { status: 500 }
          );
        }
      } else {
        // TODO Phase 8: send to observability
        console.error('Error inserting message:', insertError);
        return NextResponse.json(
          { ok: false, error: 'Something went wrong. Please try again.' },
          { status: 500 }
        );
      }
    }

    if (!message) {
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    // Bump conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Auto-generate title after first user message (use clean content)
    if (
      role === 'user' &&
      conversation.title === null &&
      conversation.title_locked === false
    ) {
      const autoTitle = cleanContent.trim().substring(0, 50);
      await supabase
        .from('conversations')
        .update({
          title: autoTitle,
          // title_locked remains false
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    }

    return NextResponse.json({ ok: true, data: { message } }, { status: 201 });
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Message insert error:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
