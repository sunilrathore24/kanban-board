import { KanbanCard } from '../models/kanban-card.interface';
import { KanbanColumn } from '../models/kanban-column.interface';

export interface CardMoveEvent {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  sourcePosition: number;
  targetPosition: number;
  card: KanbanCard;
}

export interface CardCreateEvent {
  card: KanbanCard;
  columnId: string;
}

export interface CardUpdateEvent {
  cardId: string;
  previousCard: KanbanCard;
  updatedCard: KanbanCard;
  changes: Partial<KanbanCard>;
}

export interface CardDeleteEvent {
  cardId: string;
  card: KanbanCard;
  columnId: string;
}

export interface ColumnUpdateEvent {
  columnId: string;
  previousColumn: KanbanColumn;
  updatedColumn: KanbanColumn;
  changes: Partial<KanbanColumn>;
}

export interface ConnectionStatusEvent {
  status: ConnectionStatus;
  timestamp: number;
  error?: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface DragDropEvent {
  type: 'start' | 'move' | 'end' | 'cancel';
  cardId: string;
  sourceColumnId?: string;
  targetColumnId?: string;
  position?: number;
}
