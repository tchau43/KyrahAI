// src/lib/setup-assistant.ts
import openai from './openai';
import { getSystemInstructionsFromDB } from './get-system-instructions';

interface AssistantSetupOptions {
  name?: string;
  model?: string;
  assistantId?: string;
  temperature?: number;
}

export function getAssistantId(): string {
  const assistantId = process.env.ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('ASSISTANT_ID environment variable is not set');
  }
  return assistantId;
}
export async function setupAssistant(options?: AssistantSetupOptions): Promise<string> {
  const {
    name = 'Kyrah AI Assistant',
    model = 'gpt-4.1-nano',
    assistantId,
    temperature = 0.7,
  } = options || {};

  try {
    // 1. Get system instructions from database
    const systemInstruction = await getSystemInstructionsFromDB();

    // 2. Check if assistant ID is provided or exists in environment
    const existingAssistantId = assistantId || process.env.ASSISTANT_ID;

    if (existingAssistantId) {
      // Update existing assistant

      try {
        const assistant = await openai.beta.assistants.update(existingAssistantId, {
          name,
          model,
          instructions: systemInstruction,
          temperature,
        });

        return assistant.id;
      } catch (error: any) {
        if (error?.status === 404) {
          console.warn('Assistant not found, creating new one...');
          // Fall through to create new assistant
        } else {
          throw error;
        }
      }
    }

    // 3. Create new assistant if no existing ID or assistant not found
    const assistant = await openai.beta.assistants.create({
      name,
      model,
      instructions: systemInstruction,
    });

    return assistant.id;
  } catch (error) {
    console.error('Error setting up assistant:', error);
    throw new Error(`Failed to setup assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get or verify assistant exists
 */
export async function getAssistant(assistantId?: string) {
  try {
    const id = assistantId || getAssistantId();
    const assistant = await openai.beta.assistants.retrieve(id);
    return assistant;
  } catch (error) {
    console.error('Error getting assistant:', error);
    throw new Error(`Assistant not found: ${assistantId || 'from env'}`);
  }
}

export async function updateAssistantInstructions(assistantId?: string) {
  try {
    const id = assistantId || getAssistantId();

    // Get latest instructions from database
    const systemInstruction = await getSystemInstructionsFromDB();

    // Update assistant
    const assistant = await openai.beta.assistants.update(id, {
      instructions: systemInstruction,
    });

    return assistant;
  } catch (error) {
    console.error('Error updating assistant instructions:', error);
    throw error;
  }
}

