export interface Message {
  message_id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  token_count: number | null;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
}

export interface GetMessagesParams {
  sessionId: string;
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
  anonymousToken?: string;
}

export interface GetMessagesResult {
  messages: Message[];
  total: number;
  hasMore: boolean;
}
