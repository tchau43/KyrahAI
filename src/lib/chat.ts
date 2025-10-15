// src/lib/chat.ts
import { supabase } from './supabase';
import { Message } from '@/features/chat/data';

interface SendMessageWithAIOptions {
  sessionId: string;
  content: string;
  isFirstMessage?: boolean;
}

interface SendMessageWithAIResult {
  userMessage: Message;
  assistantMessage: Message;
  tokensUsed: number;
  responseTime: number;
}

/**
 * Send a message and get AI response
 * This function calls the API route which handles OpenAI integration
 */
export async function sendMessageWithAI(
  options: SendMessageWithAIOptions
): Promise<SendMessageWithAIResult> {
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>sendMessageWithAI');
  const { sessionId, content, isFirstMessage = false } = options;

  // Call the API route
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      userMessage: content,
      isFirstMessage,
    }),
  });
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>response', response);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to send message');
  }

  const data = await response.json();
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>data', data);
  return {
    userMessage: data.userMessage,
    assistantMessage: data.assistantMessage,
    tokensUsed: data.tokensUsed,
    responseTime: data.responseTime,
  };
}

/**
 * Send the first message with AI in a new session
 * This creates the session in the database and sends the first message
 */
export async function sendFirstMessageWithAI(options: {
  sessionId: string;
  content: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<{ session: any; userMessage: Message; assistantMessage: Message }> {
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>sendFirstMessageWithAI', options);
  // Get authenticated user from Supabase
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const currentUserId = authUser?.id ?? null;
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>currentUserId', currentUserId);

  // Check if session already exists
  const { data: existing } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_id', options.sessionId)
    .maybeSingle();
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>existing', existing);
  let session;

  if (existing) {
    session = existing;
  } else {
    // Create the session in the database
    const { data: newSession, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        session_id: options.sessionId,
        user_id: currentUserId,
        is_anonymous: !currentUserId,
        auth_type: currentUserId ? 'email' : 'anonymous',
        config: {
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh',
          retention_days: 1,
        },
      })
      .select()
      .single();
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>newSession', newSession);
    if (sessionError || !newSession) {
      throw new Error('Failed to create session');
    }
    session = newSession;
  }

  // Send the message with AI (mark as first message)
  const result = await sendMessageWithAI({
    sessionId: options.sessionId,
    content: options.content,
    isFirstMessage: true,
  });
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>result', result);
  return {
    session,
    userMessage: result.userMessage,
    assistantMessage: result.assistantMessage,
  };
}

