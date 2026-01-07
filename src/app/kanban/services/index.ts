export * from './crdt.service';
export * from './websocket.service';
export * from './kanban.service';

// Angular providers for dependency injection
import { Provider } from '@angular/core';
import { CRDTService } from './crdt.service';
import { WebSocketService } from './websocket.service';
import { KanbanService } from './kanban.service';

export const KANBAN_PROVIDERS: Provider[] = [
  CRDTService,
  WebSocketService,
  KanbanService
];
