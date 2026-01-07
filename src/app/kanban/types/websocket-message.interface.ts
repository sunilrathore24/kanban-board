export interface WebSocketMessage {
  type: 'update' | 'sync' | 'heartbeat' | 'error' | 'connect' | 'disconnect';
  boardId: string;
  payload: any;
  timestamp: number;
  clientId: string;
  messageId?: string;
}

export interface KanbanUpdateEvent {
  type: 'card_created' | 'card_updated' | 'card_deleted' | 'card_moved' | 'column_updated' | 'column_created' | 'column_deleted';
  boardId: string;
  data: any;
  operationId: string;
  timestamp: number;
  clientId: string;
  previousState?: any;
}

export interface WebSocketError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface SyncRequest {
  boardId: string;
  lastKnownVersion: number;
  clientId: string;
}

export interface SyncResponse {
  boardId: string;
  currentVersion: number;
  updates: KanbanUpdateEvent[];
  fullState?: any;
}
