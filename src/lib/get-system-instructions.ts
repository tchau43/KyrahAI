// src/lib/get-system-instructions.ts
// Server-side function to get system instructions from database
import { supabase } from './supabase';

/**
 * Get system instructions from database (server-side only)
 * This function can be called from API routes and server-side code
 */
export async function getSystemInstructionsFromDB(): Promise<string> {
  try {
    // 1. Get system prompt from system_prompts table
    const { data: systemPromptData, error: systemPromptError } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('is_active', true)
      .eq('is_default', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>systemPromptData', systemPromptData);

    if (systemPromptError) {
      console.error('Error fetching system prompt:', systemPromptError);
    }

    // 2. Get all active prompt components
    // const { data: promptComponents, error: componentsError } = await supabase
    //   .from('prompt_components')
    //   .select('*')
    //   .eq('is_active', true)
    //   .order('component_name');

    // if (componentsError) {
    //   console.error('Error fetching prompt components:', componentsError);
    // }

    // 3. Build system instruction
    let systemInstruction = systemPromptData?.content 
    // || (promptComponents?.find(c => c.component_type === 'system_prompt')?.content) ||
    //   'You are Kyrah, a compassionate and knowledgeable AI assistant designed to provide support and guidance.';

    // 4. Add additional components
    // if (promptComponents && promptComponents.length > 0) {
    //   const additionalInstructions = promptComponents
    //     .filter(c => c.component_type !== 'system_prompt' && c.content)
    //     .map(c => c.content)
    //     .join('\n\n');

    //   if (additionalInstructions) {
    //     systemInstruction += '\n\n' + additionalInstructions;
    //   }
    // }

    // console.log('Built system instruction length:', systemInstruction.length);
    return systemInstruction;
  } catch (error) {
    console.error('Error getting system instructions:', error);
    // Return fallback instruction
    return 'You are Kyrah, a helpful AI assistant.';
  }
}
