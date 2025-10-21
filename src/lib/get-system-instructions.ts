import { createClient } from '../utils/supabase/server';
import { createClient as createClientDirect } from '@supabase/supabase-js';

export async function getSystemInstructionsFromDB(): Promise<string> {
  try {
    // Try to use server client first (for Next.js context)
    let supabase;
    try {
      supabase = await createClient();
    } catch (error) {
      // Fallback to direct client for standalone scripts
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      supabase = createClientDirect(supabaseUrl, supabaseKey);
    }
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
    // 3. Build system instruction
    const systemInstruction = systemPromptData?.content || 'You are Kyrah, a helpful AI assistant.';

    return systemInstruction;
  } catch (error) {
    console.error('Error getting system instructions:', error);
    // Return fallback instruction
    return 'You are Kyrah, a helpful AI assistant.';
  }
}
