import { createClient } from '../utils/supabase/server';

export async function getSystemInstructionsFromDB(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: systemPromptData, error: systemPromptError } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('is_active', true)
      .eq('is_default', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (systemPromptError) {
      console.error('Error fetching system prompt:', systemPromptError);
    }
    // const { data: promptComponents, error: componentsError } = await supabase
    //   .from('prompt_components')
    //   .select('*')
    //   .eq('is_active', true)
    //   .order('component_name');

    // if (componentsError) {
    //   console.error('Error fetching prompt components:', componentsError);
    // }

    // 3. Build system instruction
    const systemInstruction = systemPromptData?.content

    return systemInstruction;
  } catch (error) {
    console.error('Error getting system instructions:', error);
    // Return fallback instruction
    return 'You are Kyrah, a helpful AI assistant.';
  }
}
