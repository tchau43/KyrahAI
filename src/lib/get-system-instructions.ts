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

    const systemInstruction = systemPromptData?.content || 'You are Kyrah, a helpful AI assistant.';
    return systemInstruction;
  } catch (error) {
    console.error('Error getting system instructions:', error);
    return 'You are Kyrah, a helpful AI assistant.';
  }
}
