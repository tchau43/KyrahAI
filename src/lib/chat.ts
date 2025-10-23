import { createClient } from '@/utils/supabase/client';

export interface Folder {
  folder_id: string;
  user_id: string;
  folder_name: string;
  created_at: string;
  updated_at: string;
}

export interface FolderWithCount extends Folder {
  session_count: number;
}

interface FolderWithSessions extends Folder {
  sessions: Array<{ count: number }>;
}

// ============= FOLDER OPERATIONS =============

/**
 * Create a new folder
 */
export async function createFolder(folderName: string): Promise<Folder | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: user.id,
      folder_name: folderName,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating folder:', error);
    return null;
  }

  return data;
}

/**
 * Get all folders for the current user
 */
export async function getFolders(): Promise<FolderWithCount[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('folders')
    .select(`
      *,
      sessions:sessions(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<FolderWithSessions[]>();

  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }

  // Transform data to include session count
  return data.map(folder => ({
    ...folder,
    session_count: folder.sessions[0]?.count || 0,
  }));
}

/**
 * Rename a folder
 */
export async function renameFolder(folderId: string, newName: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('folders')
    .update({
      folder_name: newName,
    })
    .eq('folder_id', folderId);

  if (error) {
    console.error('Error renaming folder:', error);
    return false;
  }

  return true;
}

/**
 * Delete a folder (sessions in folder will become uncategorized)
 */
export async function deleteFolder(folderId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('folder_id', folderId);

  if (error) {
    console.error('Error deleting folder:', error);
    return false;
  }

  return true;
}

// ============= SESSION OPERATIONS =============

/**
 * Move a session to a folder
 */
export async function moveSessionToFolder(
  sessionId: string,
  folderId: string | null
): Promise<boolean> {
  const supabase = createClient();

  const updateData: { folder_id: string | null } = {
    folder_id: folderId,
  };

  const { error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error moving session to folder:', error);
    return false;
  }

  return true;
}

/**
 * Get sessions in a specific folder
 */
export async function getSessionsInFolder(folderId: string | null) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('last_activity_at', { ascending: false });

  // If folderId is null, get uncategorized sessions
  if (folderId === null) {
    query = query.is('folder_id', null);
  } else {
    query = query.eq('folder_id', folderId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data;
}

/**
 * Get all sessions for the user (including uncategorized)
 */
export async function getAllSessions() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('last_activity_at', { ascending: false });

  if (error) {
    console.error('Error fetching all sessions:', error);
    return [];
  }

  return data;
}

/**
 * Get uncategorized sessions (sessions without a folder)
 */
export async function getUncategorizedSessions() {
  return getSessionsInFolder(null);
}

// ============= UTILITY FUNCTIONS =============

/**
 * Count sessions in a folder
 */
export async function countSessionsInFolder(folderId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('folder_id', folderId)
    .is('deleted_at', null);

  if (error) {
    console.error('Error counting sessions:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Check if a folder exists
 */
export async function folderExists(folderId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('folders')
    .select('folder_id')
    .eq('folder_id', folderId)
    .single();

  return !error && !!data;
}