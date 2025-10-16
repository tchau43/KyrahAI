// src/lib/openai-helper.ts
import openai from './openai';
import { supabase } from './supabase';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionOptions {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface AssistantRunOptions {
  assistantId: string;
  threadId?: string;
  message: string;
}

/**
 * Call OpenAI Chat Completions API
 */
export async function createChatCompletion(options: ChatCompletionOptions) {
  const {
    messages,
    model = 'gpt-4.1-nano',
    temperature = 0.7,
    max_tokens = 1000,
  } = options;

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
  });

  return {
    content: completion.choices[0].message.content || '',
    tokensUsed: completion.usage?.total_tokens || 0,
    promptTokens: completion.usage?.prompt_tokens || 0,
    completionTokens: completion.usage?.completion_tokens || 0,
    finishReason: completion.choices[0].finish_reason,
  };
}

interface ChatCompletionStreamOptions extends ChatCompletionOptions {
  onToken?: (token: string) => void;
}

/**
 * Call OpenAI Chat Completions API with streaming
 */
export async function createChatCompletionStream(options: ChatCompletionStreamOptions) {
  const {
    messages,
    model = 'gpt-4.1-nano',
    temperature = 0.7,
    max_tokens = 1000,
    onToken,
  } = options;

  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
    stream: true,
  });

  let fullContent = '';
  let promptTokens = 0;
  let completionTokens = 0;

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullContent += delta;
      onToken?.(delta);
    }

    // Capture token usage if available (usually in last chunk)
    if (chunk.usage) {
      promptTokens = chunk.usage.prompt_tokens || 0;
      completionTokens = chunk.usage.completion_tokens || 0;
    }
  }

  // Estimate tokens if not provided (rough estimate: 1 token ≈ 4 characters)
  if (completionTokens === 0) {
    completionTokens = Math.ceil(fullContent.length / 4);
  }
  if (promptTokens === 0) {
    const totalPromptLength = messages.reduce((acc, msg) => acc + msg.content.length, 0);
    promptTokens = Math.ceil(totalPromptLength / 4);
  }

  return {
    content: fullContent,
    tokensUsed: promptTokens + completionTokens,
    promptTokens,
    completionTokens,
  };
}

/**
 * Run OpenAI Assistant API
 * Note: This requires ASSISTANT_ID in environment variables
 * Assistant already has system instructions configured, no need to pass them
 */
export async function runAssistant(options: AssistantRunOptions) {
  const { assistantId, threadId, message } = options;

  // Validate inputs
  if (!assistantId || !assistantId.startsWith('asst_')) {
    throw new Error('Invalid assistant ID. Must start with "asst_"');
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  try {
    // Create or use existing thread
    // Note: Each session should have its own thread for conversation continuity
    let thread;
    if (threadId && threadId.trim().length > 0) {
      // Validate thread ID format (should start with thread_)
      if (!threadId.startsWith('thread_')) {
        console.warn('Invalid thread ID format, creating new thread');
        thread = await openai.beta.threads.create();
      } else {
        thread = { id: threadId };
      }
    } else {
      // Create new thread for new session
      thread = await openai.beta.threads.create();
    }

    if (!thread?.id) {
      throw new Error('Failed to create or access thread');
    }

    console.log('Using thread ID:', thread.id);

    // Add message to thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    if (!run?.id) {
      throw new Error('Failed to create assistant run');
    }

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }


    if (runStatus.status === 'failed') {
      throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];

    if (!lastMessage?.content?.[0]) {
      throw new Error('No response from assistant');
    }

    const content = lastMessage.content[0];
    const responseText = content.type === 'text' ? content.text.value : '';

    return {
      content: responseText,
      threadId: thread.id,
      tokensUsed: runStatus.usage?.total_tokens || 0,
      promptTokens: runStatus.usage?.prompt_tokens || 0,
      completionTokens: runStatus.usage?.completion_tokens || 0,
    };
  } catch (error) {
    console.error('Error in runAssistant:', error);
    throw new Error(`Assistant API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a title for a chat session based on the first message
 */
export async function generateSessionTitle(firstMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content: 'Generate a short, concise title (max 5 words) for a chat session based on the first user message. Only return the title, nothing else.',
        },
        {
          role: 'user',
          content: firstMessage,
        },
      ],
      temperature: 0.5,
      max_tokens: 20,
    });

    return completion.choices[0].message.content?.trim() || 'New Chat';
  } catch (error) {
    console.error('Error generating session title:', error);
    return 'New Chat';
  }
}

/**
 * Get conversation history from database
 */
export async function getConversationHistory(sessionId: string, limit: number = 20) {
  const { data: messageHistory, error } = await supabase
    .from('messages')
    .select('role, content, timestamp')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching message history:', error);
    return [];
  }

  return messageHistory || [];
}

/**
 * Check if should use Assistant API or Chat Completions API
 */
export function shouldUseAssistantAPI(): boolean {
  const assistantId = process.env.ASSISTANT_ID;
  return !!(assistantId && assistantId.startsWith('asst_'));
}

