// src/app/api/chat/stream/route.ts
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createAuthenticatedSupabaseClient } from '@/lib/supabase';
import { runAssistantStream } from '@/lib/openai-helper';
import { getAssistantId } from '@/lib/setup-assistant';
import { hashToken } from '@/lib/crypto';

interface ChatRequestBody {
  sessionId: string;
  userMessage: string;
  isFirstMessage?: boolean;
}

export async function POST(request: NextRequest) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>POST');
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>request', request);
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
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>sessionId', sessionId);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>userMessage', userMessage);
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>isFirstMessage', isFirstMessage);

    // Authenticate user from JWT token if present
    let authenticatedUserId: string | null = null;
    if (authToken) {
      const { data: userResponse, error: userErr } = await authenticatedSupabase!.auth.getUser();
      if (userErr) {
        return new Response(
          JSON.stringify({ error: 'Invalid auth token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      authenticatedUserId = userResponse.user?.id ?? null;
    }

    const currentUserId = authenticatedUserId;
    const dbClient = currentUserId && authenticatedSupabase ? authenticatedSupabase : supabase;


    if (!sessionId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sessionId or userMessage' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate session ownership/access - for first message, create session if doesn't exist
    let { data: sessionRow, error: sessionErr } = await dbClient
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>sessionRow', sessionRow);

    // If session doesn't exist and this is first message, create it
    if (!sessionRow && isFirstMessage) {
      // console.log('Creating session for first message:', sessionId);
      // console.log('User info from JWT:', { authenticatedUserId, currentUserId });

      // Double-check session doesn't exist (in case of race condition)
      const { data: doubleCheckSession } = await dbClient
        .from('sessions')
        .select('session_id, user_id, is_anonymous, auth_type')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (doubleCheckSession) {
        // Session was created by another request, use it
        // console.log('Session created by concurrent request, using it');
        sessionRow = doubleCheckSession;
      } else {
        // Safe to create now
        const isAnonymous = !currentUserId;
        // console.log('Creating session with:', { sessionId, currentUserId, isAnonymous });

        // Use authenticated client for authenticated users, regular client for anonymous
        // console.log('Using DB client:', { hasAuth: !!authenticatedSupabase, isAnonymous });

        const { data: newSession, error: createErr } = await dbClient
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

        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>newSession', newSession);

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
            const hashedToken = hashToken(tokenId);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            // console.log('Creating anonymous token for session:', { sessionId, tokenId });
            const { error: tokenErr } = await dbClient
              .from('anonymous_session_tokens')
              .insert({
                token_id: tokenId,
                token_hash: hashedToken,
                session_id: sessionId,
                expires_at: expiresAt,
                user_agent: request.headers.get('user-agent') || null,
                ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
              });

            if (tokenErr) {
              console.error('Failed to create anonymous token:', tokenErr);
              // Don't fail the request, but log the error
            } else {
              console.log('Anonymous token created successfully:', { sessionId, tokenId });
            }
          } else {
            console.warn('Anonymous session created but no token provided in X-Anonymous-Token header');
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

    // Authenticated pathway - check if user is authenticated and session belongs to them
    if (!isAnonymousSession) {
      if (!authenticatedUserId) {
        return new Response(
          JSON.stringify({ error: 'User not authenticated' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Verify session belongs to the authenticated user
      if (sessionRow.user_id !== authenticatedUserId) {
        return new Response(
          JSON.stringify({ error: 'Session does not belong to user' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
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
      const hashedToken = hashToken(tokenId);
      const { data: tokenRow } = await supabase
        .from('anonymous_session_tokens')
        .select('token_id, session_id, expires_at')
        .eq('session_id', sessionId)
        .eq('token_id', hashedToken)
        .maybeSingle();

      if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired anonymous token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get assistant ID from environment
    const assistantId = getAssistantId();

    // Get thread ID from session (if exists)
    const threadId = (sessionRow as any).thread_id || null;

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>start streaming with Assistant API');
        try {
          let fullContent = '';
          let promptTokens = 0;
          let completionTokens = 0;
          let newThreadId = threadId;

          // Stream the AI response using Assistant API
          const streamResult = await runAssistantStream({
            assistantId,
            threadId: threadId || undefined,
            message: userMessage,
            onToken: (token: string) => {
              fullContent += token;
              // Send token to client
              const data = JSON.stringify({ type: 'token', content: token });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            },
          });

          fullContent = streamResult.content;
          promptTokens = streamResult.promptTokens;
          completionTokens = streamResult.completionTokens;
          newThreadId = streamResult.threadId;

          // Save messages to database after streaming completes
          // Use authenticated client for authenticated users, regular client for anonymous
          const dbClient = authenticatedUserId && authenticatedSupabase ? authenticatedSupabase : supabase;

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
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>savedUserMessage', savedUserMessage);

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

          // Update session last_activity_at, thread_id, and generate title from first message
          const updateData: { last_activity_at: string; title?: string } = {
            last_activity_at: new Date().toISOString(),
          };

          // If this is the first message, set a title based on the user message
          if (isFirstMessage) {
            const title = `Conversation at ${new Date()}`;
            updateData.title = title;
            console.log('Setting session title:', { sessionId, title });
          }

          const { error: updateErr } = await dbClient
            .from('sessions')
            .update(updateData)
            .eq('session_id', sessionId);

          if (updateErr) {
            console.error('Error updating session activity:', updateErr);
            // Don't throw, this is not critical
          } else if (isFirstMessage) {
            console.log('Session created and title set successfully');
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

