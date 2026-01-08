import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CdkDragDrop, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';

import {
  KanbanCard,
  KanbanColumn,
  KanbanBoardState,
  KanbanBoardConfig,
  KanbanTheme,
  CreateKanbanCardRequest,
  UpdateKanbanCardRequest
} from '../../models';
import {
  CardMoveEvent,
  ConnectionStatus
} from '../../types';
import { KanbanService } from '../../services';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CdkDropListGroup,
    KanbanColumnComponent
  ],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  @Input() boardId!: string;
  @Input() columns: KanbanColumn[] = [];
  @Input() cards: KanbanCard[] = [];
  @Input() config: KanbanBoardConfig = {};
  @Input() theme: KanbanTheme = {};

  @Output() cardMoved = new EventEmitter<CardMoveEvent>();
  @Output() cardCreated = new EventEmitter<KanbanCard>();
  @Output() cardUpdated = new EventEmitter<KanbanCard>();
  @Output() cardDeleted = new EventEmitter<string>();
  @Output() connectionStatusChanged = new EventEmitter<ConnectionStatus>();

  private destroy$ = new Subject<void>();
  private kanbanService = inject(KanbanService);
  private cdr = inject(ChangeDetectorRef);

  boardState: KanbanBoardState | null = null;
  connectionStatus: ConnectionStatus = 'disconnected';
  selectedCardId: string | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    // Always initialize from inputs first (for Storybook compatibility)
    this.initializeFromInputs();

    // If we have a boardId, also try to initialize the service
    if (this.boardId) {
      this.initializeBoard();
    }
  }

  private initializeFromInputs(): void {
    // Initialize directly from input properties (for Storybook)
    this.boardState = {
      id: this.boardId || 'storybook-board',
      title: 'Kanban Board',
      columns: [...(this.columns || [])],
      cards: [...(this.cards || [])],
      lastModified: new Date(),
      version: 1
    };
    this.isLoading = false;
    this.connectionStatus = 'disconnected';
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.kanbanService.disconnectFromBoard();
  }

  private initializeBoard(): void {
    this.isLoading = true;
    this.error = null;

    try {
      // Subscribe to board state changes
      this.kanbanService.getBoardState(this.boardId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (state) => {
            // Merge service state with input data
            this.boardState = {
              ...state,
              columns: state.columns.length > 0 ? state.columns : this.columns,
              cards: state.cards.length > 0 ? state.cards : this.cards
            };
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            // Fallback to input properties for Storybook
            console.warn('KanbanService not available, using input properties:', error);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });

      // Subscribe to connection status
      this.kanbanService.getConnectionStatus()
        .pipe(takeUntil(this.destroy$))
        .subscribe(status => {
          this.connectionStatus = status;
          this.connectionStatusChanged.emit(status);
          this.cdr.markForCheck();
        });

      // Connect to board for real-time updates
      if (this.config.enableRealTimeSync !== false) {
        this.kanbanService.connectToBoard(this.boardId)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }

      // Initialize with provided data if available
      if (this.columns.length > 0 || this.cards.length > 0) {
        this.initializeBoardWithData();
      }
    } catch (error) {
      // Fallback for Storybook when services aren't available
      console.warn('KanbanService not available, keeping input properties');
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private initializeBoardWithData(): void {
    if (!this.boardState) return;

    const updatedState: Partial<KanbanBoardState> = {};

    if (this.columns.length > 0) {
      updatedState.columns = this.columns;
    }

    if (this.cards.length > 0) {
      updatedState.cards = this.cards;
    }

    if (Object.keys(updatedState).length > 0) {
      this.kanbanService.updateBoardState(this.boardId, updatedState);
    }
  }

  // Card operations
  onCardDropped(event: CdkDragDrop<KanbanCard[]>): void {
    const card = event.item.data as KanbanCard;
    const targetColumnId = event.container.id.replace('column-', '');
    const targetPosition = event.currentIndex;

    // Handle drag-drop locally for Storybook
    if (this.boardState) {
      const updatedCards = [...this.boardState.cards];
      const cardIndex = updatedCards.findIndex(c => c.id === card.id);

      if (cardIndex !== -1) {
        // Update card's column and position
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          columnId: targetColumnId,
          position: targetPosition,
          updatedAt: new Date()
        };

        // Update positions of other cards in the target column
        const targetColumnCards = updatedCards
          .filter(c => c.columnId === targetColumnId && c.id !== card.id)
          .sort((a, b) => a.position - b.position);

        targetColumnCards.forEach((c, index) => {
          const newPosition = index >= targetPosition ? index + 1 : index;
          const cardIdx = updatedCards.findIndex(uc => uc.id === c.id);
          if (cardIdx !== -1) {
            updatedCards[cardIdx] = { ...updatedCards[cardIdx], position: newPosition };
          }
        });

        // Update board state
        this.boardState = {
          ...this.boardState,
          cards: updatedCards,
          lastModified: new Date(),
          version: this.boardState.version + 1
        };

        this.cdr.markForCheck();

        // Emit move event
        const moveEvent: CardMoveEvent = {
          cardId: card.id,
          sourceColumnId: card.columnId,
          targetColumnId,
          sourcePosition: card.position,
          targetPosition: targetPosition,
          card: updatedCards[cardIndex]
        };
        this.cardMoved.emit(moveEvent);
      }
    }

    // Also try to use service if available (for real applications)
    if (event.previousContainer === event.container) {
      // Reordering within same column
      this.moveCard(card.id, targetColumnId, targetPosition);
    } else {
      // Moving between columns
      this.moveCard(card.id, targetColumnId, targetPosition);
    }
  }

  onCardAdded(cardRequest: CreateKanbanCardRequest): void {
    // Handle card creation locally for Storybook
    if (this.boardState) {
      const newCard: KanbanCard = {
        id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        title: cardRequest.title,
        description: cardRequest.description,
        columnId: cardRequest.columnId,
        position: this.getCardsForColumn(cardRequest.columnId).length,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'storybook-user',
        assignees: cardRequest.assignees,
        tags: cardRequest.tags,
        priority: cardRequest.priority,
        dueDate: cardRequest.dueDate,
        metadata: cardRequest.metadata
      };

      // Update board state
      this.boardState = {
        ...this.boardState,
        cards: [...this.boardState.cards, newCard],
        lastModified: new Date(),
        version: this.boardState.version + 1
      };

      this.cdr.markForCheck();
      this.cardCreated.emit(newCard);
    }

    // Also try to use service if available (for real applications)
    try {
      this.kanbanService.createCard(this.boardId, cardRequest.columnId, cardRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (card) => {
            // Only emit if we didn't handle it locally
            if (!this.boardState) {
              this.cardCreated.emit(card);
            }
          },
          error: (error) => {
            console.error('Failed to create card via service:', error);
          }
        });
    } catch (error) {
      console.log('Service not available, using local state only');
    }
  }

  onCardUpdated(event: { cardId: string; updates: UpdateKanbanCardRequest }): void {
    // Handle card updates locally for Storybook
    if (this.boardState) {
      const updatedCards = this.boardState.cards.map(card => {
        if (card.id === event.cardId) {
          return {
            ...card,
            ...event.updates,
            updatedAt: new Date()
          };
        }
        return card;
      });

      this.boardState = {
        ...this.boardState,
        cards: updatedCards,
        lastModified: new Date(),
        version: this.boardState.version + 1
      };

      this.cdr.markForCheck();

      const updatedCard = updatedCards.find(c => c.id === event.cardId);
      if (updatedCard) {
        this.cardUpdated.emit(updatedCard);
      }
    }

    // Also try to use service if available (for real applications)
    try {
      this.kanbanService.updateCard(this.boardId, event.cardId, event.updates)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (card) => {
            // Only emit if we didn't handle it locally
            if (!this.boardState) {
              this.cardUpdated.emit(card);
            }
          },
          error: (error) => {
            console.error('Failed to update card via service:', error);
          }
        });
    } catch (error) {
      console.log('Service not available, using local state only');
    }
  }

  onCardDeleted(cardId: string): void {
    // Handle card deletion locally for Storybook
    if (this.boardState) {
      const updatedCards = this.boardState.cards.filter(card => card.id !== cardId);

      this.boardState = {
        ...this.boardState,
        cards: updatedCards,
        lastModified: new Date(),
        version: this.boardState.version + 1
      };

      this.cdr.markForCheck();
      this.cardDeleted.emit(cardId);

      if (this.selectedCardId === cardId) {
        this.selectedCardId = null;
      }
    }

    // Also try to use service if available (for real applications)
    try {
      this.kanbanService.deleteCard(this.boardId, cardId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Only emit if we didn't handle it locally
            if (!this.boardState) {
              this.cardDeleted.emit(cardId);
              if (this.selectedCardId === cardId) {
                this.selectedCardId = null;
              }
            }
          },
          error: (error) => {
            console.error('Failed to delete card via service:', error);
          }
        });
    } catch (error) {
      console.log('Service not available, using local state only');
    }
  }

  onCardSelected(cardId: string): void {
    this.selectedCardId = this.selectedCardId === cardId ? null : cardId;
    this.cdr.markForCheck();
  }

  // Column operations
  onColumnUpdated(event: { columnId: string; updates: Partial<KanbanColumn> }): void {
    // Handle column updates locally for Storybook
    if (this.boardState) {
      const updatedColumns = this.boardState.columns.map(col =>
        col.id === event.columnId ? { ...col, ...event.updates } : col
      );

      this.boardState = {
        ...this.boardState,
        columns: updatedColumns,
        lastModified: new Date(),
        version: this.boardState.version + 1
      };

      // Also update input properties to keep them in sync
      this.columns = [...updatedColumns];
      this.cdr.markForCheck();
    }

    // Also try to use service if available (for real applications)
    try {
      if (this.boardId) {
        this.kanbanService.updateBoardState(this.boardId, { columns: this.boardState?.columns || this.columns });
      }
    } catch (error) {
      console.log('Service not available, using local state only');
    }
  }

  addColumn(): void {
    if (!this.boardState) {
      // Initialize boardState if it doesn't exist
      this.boardState = {
        id: this.boardId || 'storybook-board',
        title: 'Kanban Board',
        columns: [...this.columns],
        cards: [...this.cards],
        lastModified: new Date(),
        version: 1
      };
    }

    const newColumn: KanbanColumn = {
      id: this.generateColumnId(),
      title: `Column ${this.boardState.columns.length + 1}`,
      position: this.boardState.columns.length,
      color: this.getRandomColumnColor()
    };

    // Update boardState
    this.boardState = {
      ...this.boardState,
      columns: [...this.boardState.columns, newColumn],
      lastModified: new Date(),
      version: this.boardState.version + 1
    };

    // Also update input properties to keep them in sync
    this.columns = [...this.boardState.columns];

    // Force change detection for immediate UI update
    this.cdr.detectChanges();

    // Try to update via service if available
    try {
      if (this.boardId) {
        this.kanbanService.updateBoardState(this.boardId, { columns: this.boardState.columns });
      }
    } catch (error) {
      // Service not available, that's fine for Storybook
      console.log('Service not available, using local state only');
    }
  }

  // Public methods (matching the interface from design document)
  addCard(columnId: string, card: Partial<KanbanCard>): void {
    const cardRequest: CreateKanbanCardRequest = {
      title: card.title || 'New Card',
      description: card.description,
      columnId,
      assignees: card.assignees,
      tags: card.tags,
      priority: card.priority,
      dueDate: card.dueDate,
      metadata: card.metadata
    };

    this.onCardAdded(cardRequest);
  }

  updateCard(cardId: string, updates: Partial<KanbanCard>): void {
    const updateRequest: UpdateKanbanCardRequest = {
      title: updates.title,
      description: updates.description,
      assignees: updates.assignees,
      tags: updates.tags,
      priority: updates.priority,
      dueDate: updates.dueDate,
      metadata: updates.metadata
    };

    this.onCardUpdated({ cardId, updates: updateRequest });
  }

  deleteCard(cardId: string): void {
    this.onCardDeleted(cardId);
  }

  moveCard(cardId: string, targetColumnId: string, position: number): void {
    // Try to use service if available (for real applications)
    try {
      this.kanbanService.moveCard(this.boardId, cardId, targetColumnId, position)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Emit move event only if we didn't handle it locally already
            if (!this.boardState) {
              const card = this.findCard(cardId);
              if (card) {
                const moveEvent: CardMoveEvent = {
                  cardId,
                  sourceColumnId: card.columnId,
                  targetColumnId,
                  sourcePosition: card.position,
                  targetPosition: position,
                  card: { ...card, columnId: targetColumnId, position }
                };
                this.cardMoved.emit(moveEvent);
              }
            }
          },
          error: (error) => {
            console.error('Failed to move card via service:', error);
          }
        });
    } catch (error) {
      console.log('Service not available, drag-drop handled locally');
    }
  }

  // Utility methods
  getCardsForColumn(columnId: string): KanbanCard[] {
    const cards = this.boardState?.cards || [];
    return cards
      .filter(card => card.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  }

  getConnectedDropLists(): string[] {
    const columns = this.boardState?.columns || [];
    return columns.map(col => `column-${col.id}`);
  }

  getTotalCardCount(): number {
    const cards = this.boardState?.cards || [];
    return cards.length;
  }

  getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'reconnecting': return 'Reconnecting...';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  }

  getBoardStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};

    if (this.theme.backgroundColor) {
      styles['--board-bg-color'] = this.theme.backgroundColor;
    }
    if (this.theme.primaryColor) {
      styles['--primary-color'] = this.theme.primaryColor;
    }
    if (this.theme.textColor) {
      styles['--text-color'] = this.theme.textColor;
    }

    return styles;
  }

  trackByColumnId(_index: number, column: KanbanColumn): string {
    return column.id;
  }

  retryConnection(): void {
    this.error = null;
    this.initializeBoard();
  }

  private findCard(cardId: string): KanbanCard | undefined {
    const cards = this.boardState?.cards || [];
    return cards.find(card => card.id === cardId);
  }

  private generateColumnId(): string {
    return `col_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private getRandomColumnColor(): string {
    const colors = ['#0366d6', '#28a745', '#ffd33d', '#f66a0a', '#6f42c1', '#d73a49'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
