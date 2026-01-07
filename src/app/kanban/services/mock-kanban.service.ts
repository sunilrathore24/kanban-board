import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { KanbanBoardState, KanbanCard, CreateKanbanCardRequest, UpdateKanbanCardRequest } from '../models';
import { ConnectionStatus } from '../types';

@Injectable()
export class MockKanbanService {
  private boardStateSubject = new BehaviorSubject<KanbanBoardState | null>(null);
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');

  getBoardState(boardId: string): Observable<KanbanBoardState> {
    // Return a basic board state for Storybook
    const mockState: KanbanBoardState = {
      id: boardId,
      title: 'Kanban Board',
      columns: [],
      cards: [],
      lastModified: new Date(),
      version: 1
    };

    return of(mockState);
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  connectToBoard(boardId: string): Observable<any> {
    this.connectionStatusSubject.next('connected');
    return of(null);
  }

  disconnectFromBoard(): void {
    this.connectionStatusSubject.next('disconnected');
  }

  updateBoardState(boardId: string, updates: Partial<KanbanBoardState>): Observable<KanbanBoardState> {
    const currentState = this.boardStateSubject.value;
    const updatedState = { ...currentState, ...updates } as KanbanBoardState;
    this.boardStateSubject.next(updatedState);
    return of(updatedState);
  }

  createCard(boardId: string, columnId: string, cardRequest: CreateKanbanCardRequest): Observable<KanbanCard> {
    const newCard: KanbanCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      title: cardRequest.title,
      description: cardRequest.description,
      columnId,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'mock-user',
      assignees: cardRequest.assignees,
      tags: cardRequest.tags,
      priority: cardRequest.priority,
      dueDate: cardRequest.dueDate,
      metadata: cardRequest.metadata
    };

    return of(newCard);
  }

  updateCard(boardId: string, cardId: string, updates: UpdateKanbanCardRequest): Observable<KanbanCard> {
    // Mock implementation - in real app this would update the actual card
    const mockCard: KanbanCard = {
      id: cardId,
      title: updates.title || 'Updated Card',
      description: updates.description,
      columnId: 'mock-column',
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'mock-user',
      assignees: updates.assignees,
      tags: updates.tags,
      priority: updates.priority,
      dueDate: updates.dueDate,
      metadata: updates.metadata
    };

    return of(mockCard);
  }

  deleteCard(boardId: string, cardId: string): Observable<void> {
    return of(void 0);
  }

  moveCard(boardId: string, cardId: string, targetColumnId: string, position: number): Observable<void> {
    return of(void 0);
  }
}
