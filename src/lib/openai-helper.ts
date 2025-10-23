import openai from './openai';
interface AssistantRunOptions {
  assistantId: string;
  threadId?: string;
  message: string;
}

export async function runAssistantStream(options: AssistantRunOptions & { onToken?: (token: string) => void }) {
  const { assistantId, threadId, message, onToken } = options;

  // Validate inputs
  if (!assistantId || !assistantId.startsWith('asst_')) {
    throw new Error('Invalid assistant ID. Must start with "asst_"');
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  try {
    // Create or use existing thread
    let thread;
    if (threadId && threadId.trim().length > 0 && threadId.startsWith('thread_')) {
      thread = { id: threadId };
    } else {
      // Create new thread for new session
      thread = await openai.beta.threads.create();
    }

    if (!thread?.id) {
      throw new Error('Failed to create or access thread');
    }

    // Add message to thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Run the assistant with streaming
    const stream = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      stream: true,
    });

    let fullContent = '';
    let runId = '';
    let promptTokens = 0;
    let completionTokens = 0;

    // Process the stream
    for await (const event of stream) {
      // Capture run ID
      if (event.event === 'thread.run.created' || event.event === 'thread.run.in_progress') {
        runId = event.data.id;
      }

      // Handle text deltas (streaming content)
      if (event.event === 'thread.message.delta') {
        const delta = event.data.delta;
        if (delta.content && delta.content[0]?.type === 'text') {
          const text = delta.content[0].text?.value || '';
          if (text) {
            fullContent += text;
            onToken?.(text);
          }
        }
      }

      // Capture token usage
      if (event.event === 'thread.run.completed') {
        const usage = event.data.usage;
        if (usage) {
          promptTokens = usage.prompt_tokens || 0;
          completionTokens = usage.completion_tokens || 0;
        }
      }
    }

    // Estimate tokens if not provided
    if (completionTokens === 0) {
      completionTokens = Math.ceil(fullContent.length / 4);
    }
    if (promptTokens === 0) {
      promptTokens = Math.ceil(message.length / 4);
    }

    return {
      content: fullContent,
      threadId: thread.id,
      tokensUsed: promptTokens + completionTokens,
      promptTokens,
      completionTokens,
    };
  } catch (error) {
    console.error('Error in runAssistantStream:', error);
    throw new Error(`Assistant API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
