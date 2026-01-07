import { KanbanCard } from '../models/kanban-card.interface';
import { KanbanColumn } from '../models/kanban-column.interface';

export interface KanbanCRDTDocument {
  cards: any; // Y.Array<KanbanCard> - using any to avoid Yjs import issues
  columns: any; // Y.Array<KanbanColumn>
  metadata: any; // Y.Map<any>
  operations: any; // Y.Array<Operation>
}

export interface Operation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move';
  entityType: 'card' | 'column';
  entityId: string;
  data: any;
  timestamp: number;
  clientId: string;
  dependencies?: string[];
}

export interface CRDTUpdate {
  operationId: string;
  operation: Operation;
  update: Uint8Array;
  timestamp: number;
}

export interface ConflictResolution {
  conflictId: string;
  operations: Operation[];
  resolution: 'merge' | 'last-write-wins' | 'custom';
  result: any;
  timestamp: number;
}
