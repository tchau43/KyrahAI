// src/app/api/prompt/getPromptComponents.ts

import { supabase } from '@/lib/supabase';

export async function getPromptComponents() {
  const { data, error } = await supabase
    .from('prompt_components')
    .select('*');
  if (error) {
    throw new Error(error.message);
  }
  return data;
}