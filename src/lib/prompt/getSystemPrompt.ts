// src/app/api/prompt/getSystemPrompt.ts

import { createClient } from "@/utils/supabase/server";

export async function getSystemPrompt() {
  const supabase = await createClient();
  // Get the active system prompt from system_prompts table
  const { data: systemPrompt, error: systemPromptError } = await supabase
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

  // If no system prompt found in system_prompts, fallback to prompt_components
  if (!systemPrompt) {
    const { data: componentPrompt, error: componentError } = await supabase
      .from('prompt_components')
      .select('*')
      .eq('is_active', true)
      .eq('component_type', 'system_prompt')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (componentError) {
      throw new Error(componentError.message);
    }

    return componentPrompt;
  }

  return systemPrompt;
}