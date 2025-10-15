// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getConversationHistory,
  createChatCompletion,
  runAssistant,
  generateSessionTitle,
} from '@/lib/openai-helper';
import { setupAssistant } from '@/lib/setup-assistant';
import { getSystemInstructionsFromDB } from '@/lib/get-system-instructions';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  sessionId: string;
  userMessage: string;
  isFirstMessage?: boolean;
}

export async function POST(request: NextRequest) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>POST');
  try {
    const body: ChatRequestBody = await request.json();
    const { sessionId, userMessage, isFirstMessage = false } = body;
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>sessionId', sessionId);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>userMessage', userMessage);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>isFirstMessage', isFirstMessage);
    if (!sessionId || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId or userMessage' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // 1. Get system prompt and components
    const systemPrompt = await getSystemInstructionsFromDB();
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>systemPrompt', systemPrompt);

    // 2. Get conversation history
    const messageHistory = await getConversationHistory(sessionId, 20);

    // 3. Decide whether to use Assistant API or Chat Completions API
    let useAssistant = true; // Always use Assistant API as requested

    let assistantContent: string = '';
    let tokensUsed: number = 0;
    let promptTokens: number = 0;
    let completionTokens: number = 0;
    let threadId: string | undefined;

    if (useAssistant) {
      try {
        // Create a new assistant for the request; no metadata persistence
        console.log('Creating new assistant for session:', sessionId);
        const assistantId = await setupAssistant({
          name: `Kyrah AI - Session ${sessionId.slice(0, 8)}`,
          model: 'gpt-4o-mini',
        });

        const result = await runAssistant({
          assistantId,
          message: userMessage,
        });

        assistantContent = result.content;
        tokensUsed = result.tokensUsed;
        promptTokens = result.promptTokens;
        completionTokens = result.completionTokens;
        threadId = result.threadId;
      } catch (assistantError) {
        console.error('Assistant API failed, falling back to Chat Completions:', assistantError);
        // Fall back to Chat Completions API
        useAssistant = false;
      }
    }

    if (!useAssistant) {
      // Use Chat Completions API
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
      ];

      // Add conversation history
      if (messageHistory.length > 0) {
        messageHistory.forEach((msg) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          }
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      const result = await createChatCompletion({
        messages,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
      });

      assistantContent = result.content;
      tokensUsed = result.tokensUsed;
      promptTokens = result.promptTokens;
      completionTokens = result.completionTokens;
    }

    const responseTime = Date.now() - startTime;

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>sessionId', sessionId);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>userMessage', userMessage);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>promptTokens', promptTokens);
    // 4. Save user message to database
    const { data: savedUserMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage,
        token_count: promptTokens,
      })
      .select()
      .single();
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>savedUserMessage', savedUserMessage);

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      throw new Error('Failed to save user message');
    }

    // 5. Save assistant response to database
    const { data: savedAssistantMessage, error: assistantMsgError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantContent,
        token_count: completionTokens,
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError);
      throw new Error('Failed to save assistant message');
    }

    // 6. Generate and save session title if this is the first message
    if (isFirstMessage) {
      const title = await generateSessionTitle(userMessage);
      await supabase
        .from('sessions')
        .update({ title })
        .eq('session_id', sessionId);
    }

    // 7. Log prompt usage
    const { data: systemPromptData } = await supabase
      .from('system_prompts')
      .select('prompt_id, version')
      .eq('is_active', true)
      .eq('is_default', true)
      .limit(1)
      .maybeSingle();

    if (systemPromptData) {
      await supabase.from('prompt_usage_log').insert({
        prompt_id: systemPromptData.prompt_id,
        message_id: savedAssistantMessage.message_id,
        session_id: sessionId,
        prompt_content: systemPrompt,
        prompt_version: systemPromptData.version || 'v1.0',
        response_time_ms: responseTime,
        tokens_used: tokensUsed,
        metadata: {
          use_assistant_api: useAssistant,
          thread_id: threadId,
        },
      });
    }

    // 8. Update session last_activity_at
    await supabase
      .from('sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    // 9. Return response
    return NextResponse.json({
      success: true,
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
      tokensUsed,
      responseTime,
      useAssistantAPI: useAssistant,
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

