// src/app/api/chat/stream/route.ts
// FIXED: Send title_updated event when title is ready
// Skeleton will show until real title arrives

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
import openai from '@/lib/openai';

interface ChatRequestBody {
  sessionId: string;
  userMessage: string;
  isFirstMessage?: boolean;
}

/**
 * Generate title in background
 */
async function generateTitle(
  userMessage: string,
  sessionConfig: { language?: string; timezone?: string } | null
): Promise<string> {
  try {
    const titlePrompt = `You are a title generator for a mental health support chat.
      Your goal is to create a short, calm, and general title (max 8 words) for this conversation.
      Message: "${userMessage}"
      Rules:
      1. The title must be neutral and non-triggering.
      2. NEVER repeat any specific negative, crisis, or sensitive words (like 'suicide', 'die', 'depressed', 'self-harm', etc.).
      3. DO NOT summarize the problem using negative or sensitive language.`;

    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [{ role: 'user', content: titlePrompt }],
      max_tokens: 20,
      temperature: 0.7,
    });

    const generatedTitle = titleResponse.choices?.[0]?.message?.content?.trim();
    if (generatedTitle) {
      return generatedTitle;
    }
  } catch (error) {
    console.error('Error generating title:', error);
  }

  // Fallback title generation
  const formatTimestampWithTimezone = (
    timestamp: string,
    timezone?: string,
    language?: string
  ) => {
    try {
      const date = new Date(timestamp);
      const userTimezone = timezone || 'UTC';
      const lang = language || 'en';
      const userLanguage =
        lang.includes('-')
          ? lang
          : ({
            en: 'en-US',
            vi: 'vi-VN',
            fr: 'fr-FR',
            es: 'es-ES',
            pt: 'pt-BR',
            de: 'de-DE',
          } as Record<string, string>)[lang] ?? 'en-US';
      return date.toLocaleString(userLanguage, {
        timeZone: userTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date(timestamp).toLocaleString();
    }
  };

  const formattedTime = formatTimestampWithTimezone(
    new Date().toISOString(),
    sessionConfig?.timezone,
    sessionConfig?.language
  );

  return `Conversation at ${formattedTime}`;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const anonHeader = request.headers.get('X-Anonymous-Token') || request.headers.get('x-anonymous-token');
    const supabase = await createClient();
    const body: ChatRequestBody = await request.json();
    const { sessionId, userMessage, isFirstMessage = false } = body;

    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.id ?? null;

    if (!sessionId || !userMessage) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const { data: sessionRow, error: sessionErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    let actualSessionRow = sessionRow;

    if (!sessionRow && isFirstMessage) {
      let userPreferences = null;
      if (currentUserId) {
        const { data: userPrefs } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();
        userPreferences = userPrefs ?? null;
      }
      const config = {
        language: userPreferences?.language || 'vi',
        timezone: userPreferences?.timezone || 'Asia/Ho_Chi_Minh',
        timezone_offset: userPreferences?.timezone_offset || 'UTC+7',
        retention_days: userPreferences?.retention_days || (currentUserId ? 30 : 1),
      };

      const { data: newSession, error: createErr } = await supabase
        .from('sessions')
        .insert({
          session_id: sessionId,
          user_id: currentUserId,
          is_anonymous: !currentUserId,
          auth_type: currentUserId ? 'email' : 'anonymous',
          config,
        })
        .select()
        .single();

      if (createErr || !newSession) {
        return new Response(JSON.stringify({ error: 'Failed to create session' }), { status: 500 });
      }
      actualSessionRow = newSession;

      if (!currentUserId && anonHeader) {
        const hashedToken = hashToken(anonHeader);
        await supabase.from('anonymous_session_tokens').insert({
          token_id: anonHeader,
          token_hash: hashedToken,
          session_id: sessionId,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user_agent: request.headers.get('user-agent') || null,
          ip_address: request.headers.get('x-forwarded-for') || null,
        });
      }
    }

    if (sessionErr && sessionErr.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: 'Failed to get session' }), { status: 500 });
    }
    if (!actualSessionRow) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 });
    }

    const isAnonymousSession = actualSessionRow?.is_anonymous ?? true;
    if (!isAnonymousSession) {
      if (!currentUserId || actualSessionRow.user_id !== currentUserId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
      }
    }

    if (isAnonymousSession && !isFirstMessage) {
      if (!anonHeader) {
        return new Response(JSON.stringify({ error: 'Missing anonymous token' }), { status: 401 });
      }
      const hashedToken = hashToken(anonHeader);
      const { data: tokenRow } = await supabase
        .from('anonymous_session_tokens')
        .select('token_id')
        .eq('session_id', sessionId)
        .eq('token_hash', hashedToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!tokenRow) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
      }
    }

    const assistantId = getAssistantId();
    const threadId = (actualSessionRow as { thread_id?: string }).thread_id || null;

    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        let promptTokens = 0;
        let completionTokens = 0;
        let newThreadId: string | null = null;
        let savedUserMessage: any = null;

        // Helper to send SSE events safely
        const sendEvent = (data: any) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (err) {
            console.warn('Failed to send event (stream may be closed):', err);
          }
        };

        try {
          const { data: userMsg, error: userMsgErr } = await supabase
            .from('messages')
            .insert({
              session_id: sessionId,
              role: 'user',
              content: userMessage,
              token_count: 0,
            })
            .select()
            .single();

          if (userMsgErr || !userMsg) {
            throw new Error('Failed to save user message');
          }
          savedUserMessage = userMsg;

          const riskTask = (async () => {
            let resourcesData: any[] = [];
            let riskLevel: string | null = null;
            try {
              if (containsCrisisKeywords(userMessage)) {
                sendEvent({
                  type: 'crisis_alert',
                  message: 'Detecting potential crisis indicators...',
                });
              }

              const riskResult = await assessRisk(userMessage);

              if (riskResult.success) {
                const assessment = riskResult.data;
                riskLevel = assessment.risk_level;

                saveRiskAssessment(
                  savedUserMessage.message_id,
                  sessionId,
                  assessment,
                  'v1.0'
                ).catch((err: Error) => console.error('Failed to save risk assessment:', err));

                sendEvent({
                  type: 'risk_assessment',
                  risk_level: assessment.risk_level,
                  requires_immediate_cards: assessment.requires_immediate_cards,
                  flags: assessment.flags,
                });

                if (assessment.risk_level === 'high' || assessment.requires_immediate_cards) {
                  resourcesData = await fetchRelevantResources(
                    assessment,
                    3,
                    currentUserId || undefined
                  );

                  if (resourcesData.length > 0) {
                    sendEvent({
                      type: 'resources',
                      resources: resourcesData,
                      risk_level: assessment.risk_level,
                    });
                  }
                }
              }
            } catch (error) {
              console.error('Risk assessment task error:', error);
            }
            return { resourcesData, riskLevel };
          })();

          const streamResult = await runAssistantStream({
            assistantId,
            threadId: threadId || undefined,
            message: userMessage,
            onToken: (token: string) => {
              fullContent += token;
              sendEvent({ type: 'token', content: token });
            },
          });

          promptTokens = streamResult.promptTokens;
          completionTokens = streamResult.completionTokens;
          newThreadId = streamResult.threadId;

          const { resourcesData, riskLevel } = await riskTask;

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

          // Send 'done' event immediately
          sendEvent({
            type: 'done',
            userMessage: savedUserMessage,
            assistantMessage: savedAssistantMessage,
            tokensUsed: promptTokens + completionTokens,
          });

          // IMPORTANT: Don't close controller yet if we need to send title_updated
          // We'll close it after title generation

          // Background tasks array
          const backgroundTasks: Promise<any>[] = [];

          // Update thread_id
          if (newThreadId && !threadId) {
            backgroundTasks.push(
              Promise.resolve(
                supabase
                  .from('sessions')
                  .update({ thread_id: newThreadId })
                  .eq('session_id', sessionId)
              )
                .then(() => console.log('✓ Thread ID updated'))
                .catch((err: Error) => console.error('Failed to update thread_id:', err))
            );
          }

          // Update user message token count
          backgroundTasks.push(
            Promise.resolve(
              supabase
                .from('messages')
                .update({ token_count: promptTokens })
                .eq('message_id', savedUserMessage.message_id)
            )
              .then(() => console.log('✓ User message tokens updated'))
              .catch((err: Error) => console.error('Failed to update user message tokens:', err))
          );

          // Log resource displays
          if (resourcesData.length > 0) {
            resourcesData.forEach((resource) => {
              backgroundTasks.push(
                logResourceDisplay(
                  sessionId,
                  savedAssistantMessage.message_id,
                  resource.resource_id,
                  'card'
                ).catch((err: Error) => {
                  console.warn('Failed to log resource display (non-critical):', err.message);
                })
              );
            });
          }

          // Update last_activity_at
          backgroundTasks.push(
            Promise.resolve(
              supabase
                .from('sessions')
                .update({ last_activity_at: new Date().toISOString() })
                .eq('session_id', sessionId)
            )
              .then(() => console.log('✓ Session activity updated'))
              .catch((err: Error) => console.error('Failed to update session activity:', err))
          );

          // CRITICAL: Generate title and send event BEFORE closing stream
          if (isFirstMessage) {
            try {
              const title = await generateTitle(userMessage, actualSessionRow?.config);

              // Save title to database
              await supabase
                .from('sessions')
                .update({ title: title })
                .eq('session_id', sessionId);

              // Send title_updated event while stream is still open
              sendEvent({
                type: 'title_updated',
                sessionId: sessionId,
                title: title,
              });

              console.log('✓ Title generated and sent:', title);
            } catch (err) {
              console.error('Failed to generate/save title:', err);
              // Even if title fails, don't block the stream
            }
          }

          // Wait for critical background tasks
          await Promise.allSettled(backgroundTasks);
          console.log('✓ All background tasks completed');

          // Now close the stream
          controller.close();

        } catch (error) {
          try {
            sendEvent({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            controller.close();
          } catch (streamCloseError) {
            console.error("Stream error:", error);
            console.warn("Failed to send error to client:", streamCloseError);
          }
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