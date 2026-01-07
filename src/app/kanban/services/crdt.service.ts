import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import * as Y from 'yjs';
import { KanbanCard } from '../models/kanban-card.interface';
import { KanbanColumn } from '../models/kanban-column.interface';
import { Operation, CRDTUpdate } from '../types/crdt-types.interface';

@Injectable({
  providedIn: 'root'
})
export class CRDTService {
  private documents = new Map<string, Y.Doc>();
  private updateSubjects = new Map<string, Subject<Uint8Array>>();
  private operationHistory = new Map<string, Operation[]>();

  constructor() {}

  initializeDocument(boardId: string): Y.Doc {
    if (this.documents.has(boardId)) {
      return this.documents.get(boardId)!;
    }

    const doc = new Y.Doc();
    this.documents.set(boardId, doc);

    // Initialize shared types
    const cards = doc.getArray<KanbanCard>('cards');
    const columns = doc.getArray<KanbanColumn>('columns');
    const metadata = doc.getMap('metadata');
    const operations = doc.getArray<Operation>('operations');

    // Set up update listener
    const updateSubject = new Subject<Uint8Array>();
    this.updateSubjects.set(boardId, updateSubject);

    doc.on('update', (update: Uint8Array) => {
      updateSubject.next(update);
    });

    // Initialize operation history
    this.operationHistory.set(boardId, []);

    return doc;
  }

  getSharedArray<T>(docId: string, arrayName: string): Y.Array<T> {
    const doc = this.documents.get(docId);
    if (!doc) {
      throw new Error(`Document ${docId} not found`);
    }
    return doc.getArray<T>(arrayName);
  }

  getSharedMap<T>(docId: string, mapName: string): Y.Map<T> {
    const doc = this.documents.get(docId);
    if (!doc) {
      throw new Error(`Document ${docId} not found`);
    }
    return doc.getMap<T>(mapName);
  }

  applyUpdate(docId: string, update: Uint8Array): void {
    const doc = this.documents.get(docId);
    if (!doc) {
      throw new Error(`Document ${docId} not found`);
    }

    try {
      Y.applyUpdate(doc, update);
    } catch (error) {
      console.error(`Failed to apply update to document ${docId}:`, error);
      throw error;
    }
  }

  onUpdate(docId: string): Observable<Uint8Array> {
    const updateSubject = this.updateSubjects.get(docId);
    if (!updateSubject) {
      throw new Error(`Document ${docId} not found`);
    }
    return updateSubject.asObservable();
  }

  encodeStateAsUpdate(docId: string): Uint8Array {
    const doc = this.documents.get(docId);
    if (!doc) {
      throw new Error(`Document ${docId} not found`);
    }
    return Y.encodeStateAsUpdate(doc);
  }

  // Card operations
  addCard(boardId: string, card: KanbanCard, clientId: string): void {
    const cards = this.getSharedArray<KanbanCard>(boardId, 'cards');

    // Create operation record
    const operation: Operation = {
      id: this.generateOperationId(),
      type: 'create',
      entityType: 'card',
      entityId: card.id,
      data: card,
      timestamp: Date.now(),
      clientId,
      dependencies: []
    };

    // Add to operation history
    this.addToOperationHistory(boardId, operation);

    // Apply to CRDT
    cards.push([card]);
  }

  updateCard(boardId: string, cardId: string, updates: Partial<KanbanCard>, clientId: string): void {
    const cards = this.getSharedArray<KanbanCard>(boardId, 'cards');
    const cardIndex = cards.toArray().findIndex(card => card.id === cardId);

    if (cardIndex === -1) {
      throw new Error(`Card ${cardId} not found`);
    }

    const currentCard = cards.get(cardIndex);
    const updatedCard = { ...currentCard, ...updates, updatedAt: new Date() };

    // Create operation record
    const operation: Operation = {
      id: this.generateOperationId(),
      type: 'update',
      entityType: 'card',
      entityId: cardId,
      data: { previous: currentCard, updated: updatedCard, changes: updates },
      timestamp: Date.now(),
      clientId,
      dependencies: []
    };

    // Add to operation history
    this.addToOperationHistory(boardId, operation);

    // Apply to CRDT
    cards.delete(cardIndex, 1);
    cards.insert(cardIndex, [updatedCard]);
  }

  deleteCard(boardId: string, cardId: string, clientId: string): void {
    const cards = this.getSharedArray<KanbanCard>(boardId, 'cards');
    const cardIndex = cards.toArray().findIndex(card => card.id === cardId);

    if (cardIndex === -1) {
      throw new Error(`Card ${cardId} not found`);
    }

    const card = cards.get(cardIndex);

    // Create operation record
    const operation: Operation = {
      id: this.generateOperationId(),
      type: 'delete',
      entityType: 'card',
      entityId: cardId,
      data: card,
      timestamp: Date.now(),
      clientId,
      dependencies: []
    };

    // Add to operation history
    this.addToOperationHistory(boardId, operation);

    // Apply to CRDT
    cards.delete(cardIndex, 1);
  }

  moveCard(boardId: string, cardId: string, targetColumnId: string, targetPosition: number, clientId: string): void {
    const cards = this.getSharedArray<KanbanCard>(boardId, 'cards');
    const cardIndex = cards.toArray().findIndex(card => card.id === cardId);

    if (cardIndex === -1) {
      throw new Error(`Card ${cardId} not found`);
    }

    const card = cards.get(cardIndex);
    const previousColumnId = card.columnId;
    const previousPosition = card.position;

    const updatedCard = {
      ...card,
      columnId: targetColumnId,
      position: targetPosition,
      updatedAt: new Date()
    };

    // Create operation record
    const operation: Operation = {
      id: this.generateOperationId(),
      type: 'move',
      entityType: 'card',
      entityId: cardId,
      data: {
        card: updatedCard,
        previousColumnId,
        previousPosition,
        targetColumnId,
        targetPosition
      },
      timestamp: Date.now(),
      clientId,
      dependencies: []
    };

    // Add to operation history
    this.addToOperationHistory(boardId, operation);

    // Apply to CRDT
    cards.delete(cardIndex, 1);
    cards.insert(cardIndex, [updatedCard]);
  }

  // Column operations
  addColumn(boardId: string, column: KanbanColumn, clientId: string): void {
    const columns = this.getSharedArray<KanbanColumn>(boardId, 'columns');

    // Create operation record
    const operation: Operation = {
      id: this.generateOperationId(),
      type: 'create',
      entityType: 'column',
      entityId: column.id,
      data: column,
      timestamp: Date.now(),
      clientId,
      dependencies: []
    };

    // Add to operation history
    this.addToOperationHistory(boardId, operation);

    // Apply to CRDT
    columns.push([column]);
  }

  updateColumn(boardId: string, columnId: string, updates: Partial<KanbanColumn>, clientId: string): void {
    const columns = this.getSharedArray<KanbanColumn>(boardId, 'columns');
    const columnIndex = columns.toArray().findIndex(column => column.id === columnId);

    if (columnIndex === -1) {
      throw new Error(`Column ${columnId} not found`);
    }

    const currentColumn = columns.get(columnIndex);
    const updatedColumn = { ...currentColumn, ...updates };

    // Create operation record
    const operation: Operation = {
      id: this.generateOperationId(),
      type: 'update',
      entityType: 'column',
      entityId: columnId,
      data: { previous: currentColumn, updated: updatedColumn, changes: updates },
      timestamp: Date.now(),
      clientId,
      dependencies: []
    };

    // Add to operation history
    this.addToOperationHistory(boardId, operation);

    // Apply to CRDT
    columns.delete(columnIndex, 1);
    columns.insert(columnIndex, [updatedColumn]);
  }

  // Utility methods
  getCards(boardId: string): KanbanCard[] {
    const cards = this.getSharedArray<KanbanCard>(boardId, 'cards');
    return cards.toArray();
  }

  getColumns(boardId: string): KanbanColumn[] {
    const columns = this.getSharedArray<KanbanColumn>(boardId, 'columns');
    return columns.toArray();
  }

  getOperationHistory(boardId: string): Operation[] {
    return this.operationHistory.get(boardId) || [];
  }

  private addToOperationHistory(boardId: string, operation: Operation): void {
    const history = this.operationHistory.get(boardId) || [];
    history.push(operation);
    this.operationHistory.set(boardId, history);

    // Also add to CRDT operations array for persistence
    const operations = this.getSharedArray<Operation>(boardId, 'operations');
    operations.push([operation]);
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  destroyDocument(boardId: string): void {
    const doc = this.documents.get(boardId);
    if (doc) {
      doc.destroy();
      this.documents.delete(boardId);
    }

    const updateSubject = this.updateSubjects.get(boardId);
    if (updateSubject) {
      updateSubject.complete();
      this.updateSubjects.delete(boardId);
    }

    this.operationHistory.delete(boardId);
  }
}
