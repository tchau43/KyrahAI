// src/app/api/chat/stream/route.ts
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createAuthenticatedSupabaseClient } from '@/lib/supabase';
import {
  getConversationHistory,
  createChatCompletionStream,
} from '@/lib/openai-helper';
import { getSystemInstructionsFromDB } from '@/lib/get-system-instructions';
import { hashToken } from '@/lib/crypto';

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
  const encoder = new TextEncoder();

  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>authToken', authToken);
    const anonHeader = request.headers.get('X-Anonymous-Token') || request.headers.get('x-anonymous-token');

    const authenticatedSupabase = authToken ? createAuthenticatedSupabaseClient(authToken) : null;

    const body: ChatRequestBody = await request.json();
    const { sessionId, userMessage, isFirstMessage = false } = body;

    if (!sessionId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sessionId or userMessage' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate session ownership/access - for first message, create session if doesn't exist
    let { data: sessionRow, error: sessionErr } = await supabase
      .from('sessions')
      .select('session_id, user_id, is_anonymous, auth_type')
      .eq('session_id', sessionId)
      .maybeSingle();

    // If session doesn't exist and this is first message, create it
    if (!sessionRow && isFirstMessage) {
      console.log('Creating session for first message:', sessionId);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const currentUserId = authUser?.id ?? null;

      // Double-check session doesn't exist (in case of race condition)
      const { data: doubleCheckSession } = await supabase
        .from('sessions')
        .select('session_id, user_id, is_anonymous, auth_type')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (doubleCheckSession) {
        // Session was created by another request, use it
        console.log('Session created by concurrent request, using it');
        sessionRow = doubleCheckSession;
      } else {
        // Safe to create now
        const isAnonymous = !currentUserId;
        const { data: newSession, error: createErr } = await supabase
          .from('sessions')
          .insert({
            session_id: sessionId,
            user_id: currentUserId,
            is_anonymous: isAnonymous,
            auth_type: currentUserId ? 'email' : 'anonymous',
            config: {
              language: 'vi',
              timezone: 'Asia/Ho_Chi_Minh',
              retention_days: currentUserId ? 30 : 1,
            },
          })
          .select()
          .single();

        if (createErr) {
          console.error('Failed to create session:', createErr);
          return new Response(
            JSON.stringify({
              error: 'Failed to create session',
              details: createErr?.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (!newSession) {
          console.error('Session creation returned no data');
          return new Response(
            JSON.stringify({ error: 'Failed to create session' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        sessionRow = newSession;

        // For anonymous sessions, create token record
        if (isAnonymous) {
          const tokenId = anonHeader || '';
          if (tokenId) {
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const { error: tokenErr } = await supabase
              .from('anonymous_session_tokens')
              .insert({
                token_id: tokenId,
                session_id: sessionId,
                expires_at: expiresAt,
                user_agent: request.headers.get('user-agent') || null,
                ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
              });

            if (tokenErr) {
              console.error('Failed to create anonymous token:', tokenErr);
              // Don't fail the request, but log the error
            }
          }
        }
      }
    }

    if (sessionErr && sessionErr.code !== 'PGRST116') {
      console.error('Session query error:', {
        code: sessionErr.code,
        message: sessionErr.message,
        details: sessionErr.details,
        hint: sessionErr.hint,
        sessionId,
      });
      return new Response(
        JSON.stringify({
          error: 'Failed to get session',
          details: sessionErr.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!sessionRow) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isAnonymousSession = sessionRow?.is_anonymous ?? true;

    // Authenticated pathway
    if (!isAnonymousSession && !authenticatedSupabase) {
      return new Response(
        JSON.stringify({ error: 'Missing authentication token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Anonymous pathway - validate token (skip for first message, token will be created)
    if (isAnonymousSession && !isFirstMessage) {
      const tokenId = anonHeader || '';
      if (!tokenId) {
        return new Response(
          JSON.stringify({ error: 'Missing anonymous token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate token for non-first messages
      const { data: tokenRow } = await supabase
        .from('anonymous_session_tokens')
        .select('token_id, session_id, expires_at')
        .eq('session_id', sessionId)
        .eq('token_id', tokenId)
        .maybeSingle();

      if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired anonymous token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get system prompt and conversation history
    const systemPrompt = await getSystemInstructionsFromDB();
    const messageHistory = await getConversationHistory(sessionId, 20);

    // Build messages array
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

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let promptTokens = 0;
          let completionTokens = 0;

          // Stream the AI response
          const streamResult = await createChatCompletionStream({
            messages,
            model: 'gpt-4.1-nano',
            temperature: 0.7,
            max_tokens: 1000,
            onToken: (token: string) => {
              fullContent += token;
              // Send token to client
              const data = JSON.stringify({ type: 'token', content: token });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            },
          });

          promptTokens = streamResult.promptTokens;
          completionTokens = streamResult.completionTokens;

          // Save messages to database after streaming completes
          const dbClient = authenticatedSupabase ?? supabase;

          // Save user message
          const { data: savedUserMessage, error: userMsgErr } = await dbClient
            .from('messages')
            .insert({
              session_id: sessionId,
              role: 'user',
              content: userMessage,
              token_count: promptTokens,
            })
            .select()
            .single();

          if (userMsgErr || !savedUserMessage) {
            console.error('Error saving user message:', userMsgErr);
            throw new Error(`Failed to save user message: ${userMsgErr?.message || 'Unknown error'}`);
          }

          // Save assistant message
          const { data: savedAssistantMessage, error: assistantMsgErr } = await dbClient
            .from('messages')
            .insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullContent,
              token_count: completionTokens,
            })
            .select()
            .single();

          if (assistantMsgErr || !savedAssistantMessage) {
            console.error('Error saving assistant message:', assistantMsgErr);
            throw new Error(`Failed to save assistant message: ${assistantMsgErr?.message || 'Unknown error'}`);
          }

          // Update session last_activity_at
          const { error: updateErr } = await dbClient
            .from('sessions')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('session_id', sessionId);

          if (updateErr) {
            console.error('Error updating session activity:', updateErr);
            // Don't throw, this is not critical
          }

          // Send completion event with saved message data
          const doneData = JSON.stringify({
            type: 'done',
            userMessage: savedUserMessage,
            assistantMessage: savedAssistantMessage,
            tokensUsed: promptTokens + completionTokens,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat stream API:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

