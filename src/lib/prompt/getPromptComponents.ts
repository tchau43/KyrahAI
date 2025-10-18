// src/lib/prompt/getPromptComponents.ts
import 'server-only';
import { createClient } from '@/utils/supabase/server';

export async function getPromptComponents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('prompt_components')
    .select('*');
  if (error) {
    throw new Error(error.message);
  }
  return data;
}