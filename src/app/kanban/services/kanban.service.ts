import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { map, filter, tap, catchError } from 'rxjs/operators';
import { CRDTService } from './crdt.service';
import { WebSocketService } from './websocket.service';
import {
  KanbanCard,
  KanbanColumn,
  KanbanBoardState,
  CreateKanbanCardRequest,
  UpdateKanbanCardRequest,
  KanbanValidation
} from '../models';
import {
  KanbanUpdateEvent,
  ConnectionStatus,
  CardMoveEvent,
  CardCreateEvent,
  CardUpdateEvent,
  CardDeleteEvent
} from '../types';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private boardStates = new Map<string, BehaviorSubject<KanbanBoardState>>();
  private updateEvents = new Subject<KanbanUpdateEvent>();

  constructor(
    private crdtService: CRDTService,
    private webSocketService: WebSocketService
  ) {
    this.setupWebSocketMessageHandling();
  }

  // Board State Management
  getBoardState(boardId: string): Observable<KanbanBoardState> {
    if (!this.boardStates.has(boardId)) {
      this.initializeBoardState(boardId);
    }
    return this.boardStates.get(boardId)!.asObservable();
  }

  updateBoardState(boardId: string, state: Partial<KanbanBoardState>): void {
    const currentStateSubject = this.boardStates.get(boardId);
    if (!currentStateSubject) {
      throw new Error(`Board ${boardId} not initialized`);
    }

    const currentState = currentStateSubject.value;
    const updatedState: KanbanBoardState = {
      ...currentState,
      ...state,
      lastModified: new Date(),
      version: currentState.version + 1
    };

    // Validate the updated state
    const validationErrors = KanbanValidation.validateBoardState(updatedState);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid board state: ${validationErrors.join(', ')}`);
    }

    currentStateSubject.next(updatedState);
  }

  private initializeBoardState(boardId: string): void {
    // Initialize CRDT document
    this.crdtService.initializeDocument(boardId);

    // Create initial board state
    const initialState: KanbanBoardState = {
      id: boardId,
      title: `Board ${boardId}`,
      columns: [],
      cards: [],
      lastModified: new Date(),
      version: 0
    };

    const stateSubject = new BehaviorSubject<KanbanBoardState>(initialState);
    this.boardStates.set(boardId, stateSubject);

    // Subscribe to CRDT updates
    this.crdtService.onUpdate(boardId).subscribe(update => {
      this.syncBoardStateFromCRDT(boardId);
    });
  }

  private syncBoardStateFromCRDT(boardId: string): void {
    const cards = this.crdtService.getCards(boardId);
    const columns = this.crdtService.getColumns(boardId);

    const currentStateSubject = this.boardStates.get(boardId);
    if (!currentStateSubject) return;

    const currentState = currentStateSubject.value;
    const updatedState: KanbanBoardState = {
      ...currentState,
      cards: cards.sort((a, b) => a.position - b.position),
      columns: columns.sort((a, b) => a.position - b.position),
      lastModified: new Date(),
      version: currentState.version + 1
    };

    currentStateSubject.next(updatedState);
  }

  // Card Operations
  createCard(boardId: string, columnId: string, cardRequest: CreateKanbanCardRequest): Observable<KanbanCard> {
    return new Observable<KanbanCard>(observer => {
      try {
        // Validate request
        const validationErrors = KanbanValidation.validateCreateCardRequest(cardRequest);
        if (validationErrors.length > 0) {
          observer.error(new Error(`Invalid card data: ${validationErrors.join(', ')}`));
          return;
        }

        // Get current cards in column to determine position
        const currentCards = this.crdtService.getCards(boardId)
          .filter(card => card.columnId === columnId);
        const position = currentCards.length;

        // Create card
        const card: KanbanCard = {
          id: this.generateCardId(),
          ...cardRequest,
          columnId,
          position,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: this.webSocketService.getClientId()
        };

        // Add to CRDT
        this.crdtService.addCard(boardId, card, this.webSocketService.getClientId());

        // Send update via WebSocket
        this.sendCardUpdate(boardId, 'card_created', card);

        // Emit event
        const createEvent: CardCreateEvent = { card, columnId };
        this.updateEvents.next({
          type: 'card_created',
          boardId,
          data: createEvent,
          operationId: this.generateOperationId(),
          timestamp: Date.now(),
          clientId: this.webSocketService.getClientId()
        });

        observer.next(card);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  updateCard(boardId: string, cardId: string, updates: UpdateKanbanCardRequest): Observable<KanbanCard> {
    return new Observable<KanbanCard>(observer => {
      try {
        // Get current card
        const currentCards = this.crdtService.getCards(boardId);
        const currentCard = currentCards.find(card => card.id === cardId);

        if (!currentCard) {
          observer.error(new Error(`Card ${cardId} not found`));
          return;
        }

        // Apply updates
        const updatedCard: KanbanCard = {
          ...currentCard,
          ...updates,
          updatedAt: new Date()
        };

        // Validate updated card
        const validationErrors = KanbanValidation.validateCard(updatedCard);
        if (validationErrors.length > 0) {
          observer.error(new Error(`Invalid card data: ${validationErrors.join(', ')}`));
          return;
        }

        // Update in CRDT
        this.crdtService.updateCard(boardId, cardId, updates, this.webSocketService.getClientId());

        // Send update via WebSocket
        this.sendCardUpdate(boardId, 'card_updated', updatedCard);

        // Emit event
        const updateEvent: CardUpdateEvent = {
          cardId,
          previousCard: currentCard,
          updatedCard,
          changes: updates
        };
        this.updateEvents.next({
          type: 'card_updated',
          boardId,
          data: updateEvent,
          operationId: this.generateOperationId(),
          timestamp: Date.now(),
          clientId: this.webSocketService.getClientId()
        });

        observer.next(updatedCard);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  deleteCard(boardId: string, cardId: string): Observable<void> {
    return new Observable<void>(observer => {
      try {
        // Get current card
        const currentCards = this.crdtService.getCards(boardId);
        const card = currentCards.find(c => c.id === cardId);

        if (!card) {
          observer.error(new Error(`Card ${cardId} not found`));
          return;
        }

        // Delete from CRDT
        this.crdtService.deleteCard(boardId, cardId, this.webSocketService.getClientId());

        // Send update via WebSocket
        this.sendCardUpdate(boardId, 'card_deleted', { cardId });

        // Emit event
        const deleteEvent: CardDeleteEvent = {
          cardId,
          card,
          columnId: card.columnId
        };
        this.updateEvents.next({
          type: 'card_deleted',
          boardId,
          data: deleteEvent,
          operationId: this.generateOperationId(),
          timestamp: Date.now(),
          clientId: this.webSocketService.getClientId()
        });

        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  moveCard(boardId: string, cardId: string, targetColumnId: string, targetPosition: number): Observable<void> {
    return new Observable<void>(observer => {
      try {
        // Get current card
        const currentCards = this.crdtService.getCards(boardId);
        const card = currentCards.find(c => c.id === cardId);

        if (!card) {
          observer.error(new Error(`Card ${cardId} not found`));
          return;
        }

        const sourceColumnId = card.columnId;
        const sourcePosition = card.position;

        // Update positions of other cards
        this.updateCardPositionsAfterMove(boardId, cardId, sourceColumnId, targetColumnId, targetPosition);

        // Move card in CRDT
        this.crdtService.moveCard(boardId, cardId, targetColumnId, targetPosition, this.webSocketService.getClientId());

        // Send update via WebSocket
        this.sendCardUpdate(boardId, 'card_moved', {
          cardId,
          sourceColumnId,
          targetColumnId,
          sourcePosition,
          targetPosition
        });

        // Emit event
        const moveEvent: CardMoveEvent = {
          cardId,
          sourceColumnId,
          targetColumnId,
          sourcePosition,
          targetPosition,
          card: { ...card, columnId: targetColumnId, position: targetPosition }
        };
        this.updateEvents.next({
          type: 'card_moved',
          boardId,
          data: moveEvent,
          operationId: this.generateOperationId(),
          timestamp: Date.now(),
          clientId: this.webSocketService.getClientId()
        });

        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private updateCardPositionsAfterMove(
    boardId: string,
    movedCardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetPosition: number
  ): void {
    const allCards = this.crdtService.getCards(boardId);

    if (sourceColumnId === targetColumnId) {
      // Reordering within same column
      const columnCards = allCards
        .filter(card => card.columnId === sourceColumnId && card.id !== movedCardId)
        .sort((a, b) => a.position - b.position);

      columnCards.forEach((card, index) => {
        const newPosition = index >= targetPosition ? index + 1 : index;
        if (card.position !== newPosition) {
          this.crdtService.updateCard(boardId, card.id, { position: newPosition }, this.webSocketService.getClientId());
        }
      });
    } else {
      // Moving between columns
      // Update positions in source column
      const sourceCards = allCards
        .filter(card => card.columnId === sourceColumnId && card.id !== movedCardId)
        .sort((a, b) => a.position - b.position);

      sourceCards.forEach((card, index) => {
        if (card.position !== index) {
          this.crdtService.updateCard(boardId, card.id, { position: index }, this.webSocketService.getClientId());
        }
      });

      // Update positions in target column
      const targetCards = allCards
        .filter(card => card.columnId === targetColumnId)
        .sort((a, b) => a.position - b.position);

      targetCards.forEach((card, index) => {
        const newPosition = index >= targetPosition ? index + 1 : index;
        if (card.position !== newPosition) {
          this.crdtService.updateCard(boardId, card.id, { position: newPosition }, this.webSocketService.getClientId());
        }
      });
    }
  }

  // Real-time Synchronization
  subscribeToUpdates(boardId: string): Observable<KanbanUpdateEvent> {
    return this.updateEvents.asObservable().pipe(
      filter(event => event.boardId === boardId)
    );
  }

  applyRemoteUpdate(boardId: string, update: KanbanUpdateEvent): void {
    // Apply the update to local CRDT without triggering WebSocket send
    try {
      switch (update.type) {
        case 'card_created':
          const createData = update.data as CardCreateEvent;
          this.crdtService.addCard(boardId, createData.card, update.clientId);
          break;
        case 'card_updated':
          const updateData = update.data as CardUpdateEvent;
          this.crdtService.updateCard(boardId, updateData.cardId, updateData.changes, update.clientId);
          break;
        case 'card_deleted':
          const deleteData = update.data as CardDeleteEvent;
          this.crdtService.deleteCard(boardId, deleteData.cardId, update.clientId);
          break;
        case 'card_moved':
          const moveData = update.data as CardMoveEvent;
          this.crdtService.moveCard(boardId, moveData.cardId, moveData.targetColumnId, moveData.targetPosition, update.clientId);
          break;
      }
    } catch (error) {
      console.error('Failed to apply remote update:', error);
    }
  }

  // WebSocket Integration
  connectToBoard(boardId: string): Observable<ConnectionStatus> {
    return this.webSocketService.connect(boardId);
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.webSocketService.getConnectionStatus();
  }

  private setupWebSocketMessageHandling(): void {
    this.webSocketService.onMessage().subscribe(message => {
      if (message.type === 'update') {
        const updateEvent = message.payload as KanbanUpdateEvent;
        this.applyRemoteUpdate(message.boardId, updateEvent);
      }
    });
  }

  private sendCardUpdate(boardId: string, type: string, data: any): void {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.sendUpdate(boardId, {
        type,
        data,
        timestamp: Date.now(),
        clientId: this.webSocketService.getClientId()
      });
    }
  }

  // Utility methods
  private generateCardId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  disconnectFromBoard(): void {
    this.webSocketService.disconnect();
  }

  destroyBoard(boardId: string): void {
    const stateSubject = this.boardStates.get(boardId);
    if (stateSubject) {
      stateSubject.complete();
      this.boardStates.delete(boardId);
    }
    this.crdtService.destroyDocument(boardId);
  }
}
