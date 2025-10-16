// src/lib/setup-assistant.ts
import openai from './openai';
import { getSystemInstructionsFromDB } from './get-system-instructions';

interface AssistantSetupOptions {
  name?: string;
  model?: string;
}

/**
 * Setup OpenAI Assistant with system instructions from database
 * This creates a NEW assistant for each session (as requested)
 */
export async function setupAssistant(options?: AssistantSetupOptions): Promise<string> {
  const {
    name = 'Kyrah AI Assistant',
    model = 'gpt-4.1-nano',
  } = options || {};

  try {
    // 1. Get system instructions from database
    const systemInstruction = await getSystemInstructionsFromDB();
    // console.log('System instruction length:', systemInstruction.length);

    // 2. Create NEW assistant for this session
    console.log('Creating new assistant for session...');

    const assistant = await openai.beta.assistants.create({
      name: `${name} - ${new Date().toISOString()}`,
      model,
      instructions: systemInstruction,
    });

    console.log('Assistant created successfully:', assistant.id);
    return assistant.id;
  } catch (error) {
    console.error('Error setting up assistant:', error);
    throw new Error(`Failed to setup assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get or verify assistant exists
 */
// export async function getAssistant(assistantId: string) {
//   try {
//     const assistant = await openai.beta.assistants.retrieve(assistantId);
//     return assistant;
//   } catch (error) {
//     console.error('Error getting assistant:', error);
//     throw new Error(`Assistant not found: ${assistantId}`);
//   }
// }

/**
 * Update assistant instructions from database
 * Call this when you update prompts in database
 */
export async function updateAssistantInstructions(assistantId: string) {
  try {
    // Get latest instructions from database
    const systemInstruction = await getSystemInstructionsFromDB();

    // Update assistant
    const assistant = await openai.beta.assistants.update(assistantId, {
      instructions: systemInstruction,
    });

    console.log('Assistant instructions updated successfully');
    return assistant;
  } catch (error) {
    console.error('Error updating assistant instructions:', error);
    throw error;
  }
}

