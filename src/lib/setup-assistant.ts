// src/lib/setup-assistant.ts
import openai from './openai';
import { getSystemInstructionsFromDB } from './get-system-instructions';

interface AssistantSetupOptions {
  name?: string;
  model?: string;
  assistantId?: string;
  temperature?: number;
}

/**
 * Get the assistant ID from environment variable
 */
export function getAssistantId(): string {
  const assistantId = process.env.ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('ASSISTANT_ID environment variable is not set');
  }
  return assistantId;
}

/**
 * Setup or update OpenAI Assistant with system instructions from database
 * This function should be run manually when you want to update the assistant configuration
 * It will either create a new assistant or update the existing one based on ASSISTANT_ID
 */
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
    // console.log('System instruction length:', systemInstruction.length);

    // 2. Check if assistant ID is provided or exists in environment
    const existingAssistantId = assistantId || process.env.ASSISTANT_ID;

    if (existingAssistantId) {
      // Update existing assistant
      console.log('Updating existing assistant:', existingAssistantId);

      try {
        const assistant = await openai.beta.assistants.update(existingAssistantId, {
          name,
          model,
          instructions: systemInstruction,
          temperature,
        });

        console.log('Assistant updated successfully:', assistant.id);
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
    console.log('Creating new assistant...');
    const assistant = await openai.beta.assistants.create({
      name,
      model,
      instructions: systemInstruction,
    });

    console.log('Assistant created successfully:', assistant.id);
    console.log('⚠️  IMPORTANT: Add this to your .env file:');
    console.log(`ASSISTANT_ID=${assistant.id}`);

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

/**
 * Update assistant instructions from database
 * Call this when you update prompts in database
 */
export async function updateAssistantInstructions(assistantId?: string) {
  try {
    const id = assistantId || getAssistantId();

    // Get latest instructions from database
    const systemInstruction = await getSystemInstructionsFromDB();

    // Update assistant
    const assistant = await openai.beta.assistants.update(id, {
      instructions: systemInstruction,
    });

    console.log('Assistant instructions updated successfully:', assistant.id);
    return assistant;
  } catch (error) {
    console.error('Error updating assistant instructions:', error);
    throw error;
  }
}

