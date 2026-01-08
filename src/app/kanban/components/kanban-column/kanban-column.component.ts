import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDragPlaceholder
} from '@angular/cdk/drag-drop';
import { KanbanCard, KanbanColumn, CreateKanbanCardRequest, UpdateKanbanCardRequest } from '../../models';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    KanbanCardComponent
  ],
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanColumnComponent implements OnInit, OnDestroy {
  @Input() column!: KanbanColumn;
  @Input() cards: KanbanCard[] = [];
  @Input() allowDrop = true;
  @Input() allowDrag = true;
  @Input() editable = true;
  @Input() connectedDropLists: string[] = [];
  @Input() selectedCardId: string | null = null;

  @Output() cardDropped = new EventEmitter<CdkDragDrop<KanbanCard[]>>();
  @Output() cardAdded = new EventEmitter<CreateKanbanCardRequest>();
  @Output() cardUpdated = new EventEmitter<{ cardId: string; updates: UpdateKanbanCardRequest }>();
  @Output() cardDeleted = new EventEmitter<string>();
  @Output() cardSelected = new EventEmitter<string>();
  @Output() columnUpdated = new EventEmitter<{ columnId: string; updates: Partial<KanbanColumn> }>();

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('newCardInput') newCardInput?: ElementRef<HTMLInputElement>;

  isEditingTitle = false;
  editableTitle = '';
  isAddingCard = false;
  newCardTitle = '';
  showColumnMenu = false;

  ngOnInit(): void {
    this.editableTitle = this.column.title;
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Title editing
  startTitleEditing(): void {
    if (!this.editable) return;

    this.isEditingTitle = true;
    this.editableTitle = this.column.title;

    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
      this.titleInput?.nativeElement.select();
    });
  }

  saveTitleChanges(): void {
    if (!this.isEditingTitle) return;

    const newTitle = this.editableTitle.trim();
    if (newTitle && newTitle !== this.column.title) {
      this.columnUpdated.emit({
        columnId: this.column.id,
        updates: { title: newTitle }
      });
    }

    this.cancelTitleEditing();
  }

  cancelTitleEditing(): void {
    this.isEditingTitle = false;
    this.editableTitle = this.column.title;
  }

  // Card management
  startAddingCard(): void {
    if (!this.allowCardCreation()) return;

    this.isAddingCard = true;
    this.newCardTitle = '';

    setTimeout(() => {
      this.newCardInput?.nativeElement.focus();
    });
  }

  addCard(): void {
    if (!this.newCardTitle.trim()) {
      this.cancelAddingCard();
      return;
    }

    const cardRequest: CreateKanbanCardRequest = {
      title: this.newCardTitle.trim(),
      columnId: this.column.id
    };

    this.cardAdded.emit(cardRequest);
    this.cancelAddingCard();
  }

  cancelAddingCard(): void {
    this.isAddingCard = false;
    this.newCardTitle = '';
  }

  onCardUpdated(cardId: string, updates: UpdateKanbanCardRequest): void {
    this.cardUpdated.emit({ cardId, updates });
  }

  onCardDeleted(cardId: string): void {
    this.cardDeleted.emit(cardId);
  }

  onCardSelected(cardId: string): void {
    this.cardSelected.emit(cardId);
  }

  // Drag and drop
  onCardDropped(event: CdkDragDrop<KanbanCard[]>): void {
    this.cardDropped.emit(event);
  }

  trackByCardId(_index: number, card: KanbanCard): string {
    return card.id;
  }

  // Column menu
  toggleColumnMenu(): void {
    this.showColumnMenu = !this.showColumnMenu;
  }

  closeColumnMenu(): void {
    this.showColumnMenu = false;
  }

  clearColumn(): void {
    if (confirm(`Are you sure you want to delete all ${this.cards.length} cards in this column?`)) {
      this.cards.forEach(card => {
        this.cardDeleted.emit(card.id);
      });
    }
  }

  toggleCollapse(): void {
    this.columnUpdated.emit({
      columnId: this.column.id,
      updates: { isCollapsed: !this.column.isCollapsed }
    });
  }

  // Utility methods
  allowCardCreation(): boolean {
    if (!this.editable) return false;
    if (this.column.cardLimit && this.cards.length >= this.column.cardLimit) return false;
    return true;
  }

  isWipLimitExceeded(): boolean {
    return !!(this.column.wipLimit && this.cards.length > this.column.wipLimit);
  }

  getCardCountText(): string {
    const count = this.cards.length;
    return count === 1 ? '1 card' : `${count} cards`;
  }
}
