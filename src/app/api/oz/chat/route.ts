import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, type PromptContextSlots } from '@/lib/prompt/buildPrompt';
import { normalizeMessages, trimMessagesForTokenBudget } from '@/lib/chat/history';
import type { Message } from '@/lib/chat/types';
import { getSearchProvider, shouldSearch, formatSearchResults, formatSources } from '@/lib/tools/search/provider';
import { supabaseServer } from '@/lib/supabase/server';
import { stripMemoryMarkers } from '@/lib/memory/parse';

export const runtime = 'nodejs';

function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.slice(0, 48).trim();
  return trimmed.replace(/[.,!?;:]$/, '') || 'Untitled';
}

export async function POST(request: NextRequest) {
  try {
    // Debug logging for Tavily configuration
    console.log('Tavily key present:', Boolean(process.env.TAVILY_API_KEY));
    const searchProvider = getSearchProvider();
    console.log('Tavily configured:', searchProvider?.isConfigured?.() ?? null);

    const body = await request.json();
    const { messages, slots = {}, conversationId: clientConversationId } = body as {
      messages: Message[];
      slots?: PromptContextSlots;
      conversationId?: string | null;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { text: 'I ran into a technical issue. Please try again in a moment.' },
        { status: 200 }
      );
    }

    // Step 1: Normalize and trim messages
    const normalizedMessages = normalizeMessages(messages);
    const trimmedMessages = trimMessagesForTokenBudget(normalizedMessages, 8000);

    const lastUserMessage = trimmedMessages.filter((msg) => msg.role === 'user').pop();

    // Step 1.5: Get authenticated user and fetch career file
    // Graceful degradation: null careerFile = no career context
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    let careerFile: {
      display_name?: string | null;
      user_current_role?: string | null;
      target_role?: string | null;
      goals?: string | null;
    } | null = null;
    let memoryItems: Array<{ key: string; value: string }> | null = null;
    let conversationId: string | null = null;
    
    if (user) {
      try {
        // Fetch career file
        const { data: file } = await supabase
          .from('career_files')
          .select('display_name, user_current_role, target_role, goals')
          .eq('user_id', user.id)
          .single();
        // Map user_current_role to current_role for buildPrompt compatibility
        careerFile = file ? {
          display_name: file.display_name,
          user_current_role: file.user_current_role,
          target_role: file.target_role,
          goals: file.goals,
        } : null;
      } catch (error) {
        // Graceful degradation: null careerFile = no career context
        console.error('Error fetching career file:', error);
        careerFile = null;
      }

      try {
        // Fetch active memory items
        const { data: items } = await supabase
          .from('memory_items')
          .select('key, value')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('updated_at', { ascending: false });

        if (items && items.length > 0) {
          memoryItems = items.map(item => ({
            key: item.key,
            value: item.value,
          }));
        }
      } catch (error) {
        // Graceful degradation: null memoryItems = no memory context
        console.error('Error fetching memory items:', error);
        memoryItems = null;
      }

      // Resolve conversation: use client id if valid, else create on first user message only
      try {
        if (clientConversationId) {
          const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', clientConversationId)
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .single();
          if (existing) conversationId = existing.id;
        }

        // No conversation yet: create only when we have a first user message (new chat)
        if (!conversationId && lastUserMessage) {
          const title = generateTitle(lastUserMessage.content);
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
              user_id: user.id,
              title,
              title_locked: false,
            })
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating conversation:', createError);
          } else {
            conversationId = newConversation.id;
          }
        }
      } catch (error) {
        console.error('Error resolving conversation:', error);
      }
    }

    // Step 2: Save user message to database (if authenticated and conversation exists)
    if (lastUserMessage && conversationId && user) {
      try {
        // Generate a client_msg_id for deduplication (use timestamp + random)
        const clientMsgId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Save user message (strip memory markers before saving)
        const cleanUserContent = stripMemoryMarkers(lastUserMessage.content);
        
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: 'user',
            content: cleanUserContent,
            client_msg_id: clientMsgId,
          });
        
        // Update conversation updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } catch (error) {
        // Non-blocking: log error but continue with chat
        console.error('Error saving user message:', error);
      }
    }
    
    let searchResults: { results: Array<{ title: string; url: string; content: string }> } | null = null;
    let searchDecision: 'explicit' | 'ask_permission' | 'not_needed' = 'not_needed';
    let searchFailed = false;

    if (lastUserMessage) {
      searchDecision = shouldSearch(lastUserMessage.content);
      
      // Perform explicit search if needed and provider is configured
      if (searchDecision === 'explicit' && searchProvider) {
        try {
          const searchResponse = await searchProvider.search(lastUserMessage.content);
          searchResults = { results: searchResponse.results };
        } catch (error) {
          // TODO Phase 8: send to observability
          console.error('Search failed:', error);
          searchFailed = true;
          // Continue without search results
        }
      }
    }

    // Step 3: Build prompt with system instruction, context, and messages
    const promptPayload = buildPrompt({
      messages: trimmedMessages,
      slots: slots || {},
      searchResults,
      searchConfigured: !!searchProvider,
      searchDecision,
      searchFailed,
      careerFile,
      memoryItems,
    });

    // Get API configuration from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const maxTokens = parseInt(process.env.OPENAI_MAX_OUTPUT_TOKENS || '2000', 10);

    if (!apiKey) {
      // TODO Phase 8: send to observability
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { text: 'I ran into a technical issue. Please try again in a moment.' },
        { status: 200 }
      );
    }

    // Step 3: Prepare messages for OpenAI API
    const systemContent = promptPayload.system + (promptPayload.context ? `\n\n${promptPayload.context}` : '');
    
    const openAIMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...promptPayload.messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
    ];

    // Step 4: Call OpenAI Responses API (non-streaming)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openAIMessages,
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // TODO Phase 8: send to observability
      console.error('OpenAI API error:', {
        status: response.status,
        error: errorData.error || 'Unknown error',
      });
      return NextResponse.json(
        { text: 'I ran into a technical issue. Please try again in a moment.' },
        { status: 200 }
      );
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;

    if (!text) {
      // TODO Phase 8: send to observability
      console.error('No content in OpenAI response:', data);
      return NextResponse.json(
        { text: 'I ran into a technical issue. Please try again in a moment.' },
        { status: 200 }
      );
    }

    // Append sources if search was performed
    if (searchResults && searchResults.results.length > 0) {
      text += formatSources(searchResults);
    }

    // Step 5: Save assistant response to database (if authenticated and conversation exists)
    if (conversationId && user) {
      try {
        // Generate a client_msg_id for deduplication
        const clientMsgId = `assistant_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Save assistant message (strip memory markers before saving)
        const cleanAssistantContent = stripMemoryMarkers(text);
        
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: 'assistant',
            content: cleanAssistantContent,
            client_msg_id: clientMsgId,
          });
        
        // Update conversation updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } catch (error) {
        // Non-blocking: log error but continue - response is already generated
        console.error('Error saving assistant message:', error);
      }
    }

    // Return text with markers intact - client will detect and strip for display
    // Database already has clean version (markers stripped). Include conversationId when set so client can store it.
    return NextResponse.json(
      conversationId ? { text, conversationId } : { text }
    );
  } catch (error) {
    // TODO Phase 8: send to observability
    console.error('Chat API error:', error);
    return NextResponse.json(
      { text: 'I ran into a technical issue. Please try again in a moment.' },
      { status: 200 }
    );
  }
}
