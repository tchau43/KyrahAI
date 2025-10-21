// src/app/api/chat/stream/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';
import { runAssistantStream } from '@/lib/openai-helper';
import { getAssistantId } from '@/lib/setup-assistant';
import { hashToken } from '@/lib/crypto';
import { assessRisk, containsCrisisKeywords } from '@/services/risk-assessment.service';
import {
  saveRiskAssessment,
  fetchRelevantResources,
  logResourceDisplay,
} from '@/services/db-risk-assessment.service';

interface ChatRequestBody {
  sessionId: string;
  userMessage: string;
  isFirstMessage?: boolean;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    // Get anonymous token header (for anonymous users only)
    const anonHeader = request.headers.get('X-Anonymous-Token') || request.headers.get('x-anonymous-token');

    // Create Supabase client - automatically reads JWT from cookies for authenticated users
    const supabase = await createClient();

    const body: ChatRequestBody = await request.json();
    const { sessionId, userMessage, isFirstMessage = false } = body;

    // Check if user is authenticated (JWT in cookies) using helper function
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.id ?? null;

    if (!sessionId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sessionId or userMessage' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate session ownership/access - for first message, create session if doesn't exist
    const { data: sessionRow, error: sessionErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    // Track the actual session row to use (may be created in this block)
    let actualSessionRow = sessionRow;

    // If session doesn't exist and this is first message, create it
    if (!sessionRow && isFirstMessage) {
      // Double-check session doesn't exist (in case of race condition)
      const { data: doubleCheckSession } = await supabase
        .from('sessions')
        .select('session_id, user_id, is_anonymous, auth_type')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (doubleCheckSession) {
        actualSessionRow = doubleCheckSession;
      } else {
        const isAnonymous = !currentUserId;

        // Fetch user preferences for authenticated users
        let userPreferences = null;
        if (currentUserId) {
          try {
            // Fetch user preferences directly using server client
            const { data: userPrefs, error: prefError } = await supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', currentUserId)
              .single();

            if (!prefError || prefError.code === 'PGRST116') {
              userPreferences = userPrefs;
            }
          } catch (error) {
            console.warn('Failed to fetch user preferences, using defaults:', error);
          }
        }

        // Build config based on user preferences or defaults
        const config = {
          language: userPreferences?.language || 'vi',
          timezone: userPreferences?.timezone || 'Asia/Ho_Chi_Minh',
          timezone_offset: userPreferences?.timezone_offset || '+07:00',
          retention_days: userPreferences?.retention_days || (currentUserId ? 30 : 1),
        };

        const { data: newSession, error: createErr } = await supabase
          .from('sessions')
          .insert({
            session_id: sessionId,
            user_id: currentUserId,
            is_anonymous: isAnonymous,
            auth_type: currentUserId ? 'email' : 'anonymous',
            config,
          })
          .select()
          .single();

        if (createErr || !newSession) {
          return new Response(
            JSON.stringify({ error: 'Failed to create session' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        actualSessionRow = newSession;

        // For anonymous sessions, create token record
        if (isAnonymous && anonHeader) {
          const tokenId = anonHeader;
          const hashedToken = hashToken(tokenId);
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          await supabase.from('anonymous_session_tokens').insert({
            token_id: tokenId,
            token_hash: hashedToken,
            session_id: sessionId,
            expires_at: expiresAt,
            user_agent: request.headers.get('user-agent') || null,
            ip_address: request.headers.get('x-forwarded-for') || null,
          });
        }
      }
    }

    if (sessionErr && sessionErr.code !== 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Failed to get session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!actualSessionRow) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isAnonymousSession = actualSessionRow?.is_anonymous ?? true;

    // Validate session ownership
    if (!isAnonymousSession) {
      if (!currentUserId || actualSessionRow.user_id !== currentUserId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate anonymous token (skip for first message)
    if (isAnonymousSession && !isFirstMessage) {
      const tokenId = anonHeader || '';
      if (!tokenId) {
        return new Response(
          JSON.stringify({ error: 'Missing anonymous token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const hashedToken = hashToken(tokenId);
      const { data: tokenRow } = await supabase
        .from('anonymous_session_tokens')
        .select('token_id, session_id, expires_at')
        .eq('session_id', sessionId)
        .eq('token_hash', hashedToken)
        .maybeSingle();

      if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get assistant ID (your existing assistant)
    const assistantId = getAssistantId();

    // Get thread ID from session
    const threadId = actualSessionRow && 'thread_id' in actualSessionRow
      ? (actualSessionRow as { thread_id?: string }).thread_id || null
      : null;

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let promptTokens = 0;
          let completionTokens = 0;

          const { data: savedUserMessage, error: userMsgErr } = await supabase
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
            throw new Error('Failed to save user message');
          }

          const streamResult = await runAssistantStream({
            assistantId,
            threadId: threadId || undefined,
            message: userMessage,
            onToken: (token: string) => {
              fullContent += token;
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'token', content: token })}\n\n`
              ));
            },
          });

          const { content, promptTokens: streamPromptTokens, completionTokens: streamCompletionTokens, threadId: newThreadId } = streamResult;
          fullContent = content;
          promptTokens = streamPromptTokens;
          completionTokens = streamCompletionTokens;

          // Persist new thread ID to session if this is a new thread
          if (newThreadId && !threadId) {
            await supabase
              .from('sessions')
              .update({ thread_id: newThreadId })
              .eq('session_id', sessionId);
          }

          // 3) Update prompt token_count on saved user message
          await supabase
            .from('messages')
            .update({ token_count: promptTokens })
            .eq('message_id', savedUserMessage.message_id);

          let resourcesData: any[] = [];
          let riskLevel: string | null = null;

          const hasCrisisKeywords = containsCrisisKeywords(userMessage);
          if (hasCrisisKeywords) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'crisis_alert',
                  message: 'Detecting potential crisis indicators...',
                })}\n\n`
              )
            );
          }

          try {
            const riskResult = await assessRisk(userMessage);

            if (riskResult.success) {
              const assessment = riskResult.data;
              riskLevel = assessment.risk_level;

              await saveRiskAssessment(
                savedUserMessage.message_id,
                sessionId,
                assessment,
                'v1.0'
              );

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'risk_assessment',
                    risk_level: assessment.risk_level,
                    requires_immediate_cards: assessment.requires_immediate_cards,
                    flags: assessment.flags,
                  })}\n\n`
                )
              );

              if (assessment.risk_level === 'high' || assessment.requires_immediate_cards) {
                resourcesData = await fetchRelevantResources(
                  assessment,
                  3,
                  currentUserId || undefined
                );

                if (resourcesData.length > 0) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: 'resources',
                        resources: resourcesData,
                        risk_level: assessment.risk_level,
                      })}\n\n`
                    )
                  );
                }
              }
            }
          } catch (error) {
            console.error('Risk assessment error:', error);
          }

          const { data: savedAssistantMessage, error: assistantMsgErr } = await supabase
            .from('messages')
            .insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullContent,
              token_count: completionTokens,
              metadata: {
                resources: resourcesData,
                riskLevel: riskLevel,
              },
            })
            .select()
            .single();

          if (assistantMsgErr || !savedAssistantMessage) {
            throw new Error('Failed to save assistant message');
          }
          if (resourcesData.length > 0) {
            resourcesData.forEach((resource) => {
              logResourceDisplay(
                sessionId,
                savedAssistantMessage.message_id,
                resource.resource_id,
                'card'
              ).catch((err) => {
                console.warn('Failed to log resource display (non-critical):', err.message);
              });
            });
          }

          // Update session (use service role client)
          const updateData: { last_activity_at: string; title?: string } = {
            last_activity_at: new Date().toISOString(),
          };

          if (isFirstMessage) {
            // Format timestamp with user's timezone
            const formatTimestampWithTimezone = (timestamp: string, timezone?: string, language?: string) => {
              try {
                const date = new Date(timestamp);

                // Use session timezone if available, otherwise fallback to UTC
                const userTimezone = timezone || 'UTC';

                // Use session language if available, otherwise fallback to English
                const userLanguage = language ? `${language}-${language.toUpperCase()}` : 'en-US';

                return date.toLocaleString(userLanguage, {
                  timeZone: userTimezone,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
              } catch (error) {
                console.error('Error formatting timestamp:', error);
                return new Date(timestamp).toLocaleString();
              }
            };

            const sessionConfig = actualSessionRow?.config as any;
            const formattedTime = formatTimestampWithTimezone(
              new Date().toISOString(),
              sessionConfig?.timezone,
              sessionConfig?.language
            );

            updateData.title = `Conversation at ${formattedTime}`;
          }

          await supabase
            .from('sessions')
            .update(updateData)
            .eq('session_id', sessionId);

          // Send completion event
          const doneData = JSON.stringify({
            type: 'done',
            userMessage: savedUserMessage,
            assistantMessage: savedAssistantMessage,
            tokensUsed: promptTokens + completionTokens,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
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
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}