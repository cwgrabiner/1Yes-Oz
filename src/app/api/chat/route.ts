import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt } from '@/lib/prompt/buildPrompt';
import type { Message } from '@/lib/chat/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Build prompt with context slots (empty for now)
    // Graceful degradation: null careerFile = no career context, null memoryItems = no memory
    const promptPayload = buildPrompt({
      messages,
      slots: {},
      careerFile: null, // Legacy route doesn't fetch career file
      memoryItems: null, // Legacy route doesn't fetch memory items
    });

    // Get API key and model from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Prepare messages for OpenAI API
    const openAIMessages = [
      {
        role: 'system',
        content: promptPayload.system + (promptPayload.context ? `\n\n${promptPayload.context}` : ''),
      },
      ...promptPayload.messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openAIMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error?.message || `OpenAI API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content in OpenAI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
