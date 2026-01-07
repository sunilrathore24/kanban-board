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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragPlaceholder,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { KanbanCard, KanbanColumn, CreateKanbanCardRequest, UpdateKanbanCardRequest } from '../../models';
import { CardMoveEvent } from '../../types';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    KanbanCardComponent
  ],
  template: `
    <div class="kanban-column" [style.border-left-color]="column.color">
      <!-- Column Header -->
      <div class="column-header">
        <div class="column-title-section">
          <input
            #titleInput
            *ngIf="isEditingTitle; else titleDisplay"
            [(ngModel)]="editableTitle"
            class="title-input"
            (blur)="saveTitleChanges()"
            (keydown.enter)="saveTitleChanges()"
            (keydown.escape)="cancelTitleEditing()"
            maxlength="50"
          />
          <ng-template #titleDisplay>
            <h2 class="column-title" (dblclick)="startTitleEditing()">
              {{ column.title }}
            </h2>
          </ng-template>

          <div class="column-info">
            <span class="card-count">{{ cards.length }}</span>
            <span class="wip-limit" *ngIf="column.wipLimit" [class.exceeded]="isWipLimitExceeded()">
              / {{ column.wipLimit }}
            </span>
          </div>
        </div>

        <div class="column-actions">
          <button
            class="add-card-btn"
            (click)="startAddingCard()"
            [disabled]="isAddingCard || !allowCardCreation()"
            title="Add new card"
          >
            +
          </button>

          <button
            class="column-menu-btn"
            (click)="toggleColumnMenu()"
            title="Column options"
          >
            ⋮
          </button>
        </div>
      </div>

      <!-- Column Description -->
      <div class="column-description" *ngIf="column.description">
        <p>{{ column.description }}</p>
      </div>

      <!-- Add Card Form -->
      <div class="add-card-form" *ngIf="isAddingCard">
        <input
          #newCardInput
          [(ngModel)]="newCardTitle"
          class="new-card-input"
          placeholder="Enter card title..."
          (keydown.enter)="addCard()"
          (keydown.escape)="cancelAddingCard()"
          (blur)="addCard()"
          maxlength="100"
        />
        <div class="add-card-actions">
          <button class="save-btn" (click)="addCard()" [disabled]="!newCardTitle.trim()">
            Add Card
          </button>
          <button class="cancel-btn" (click)="cancelAddingCard()">
            Cancel
          </button>
        </div>
      </div>

      <!-- Cards Drop List -->
      <div
        class="cards-container"
        cdkDropList
        [cdkDropListData]="cards"
        [cdkDropListConnectedTo]="connectedDropLists"
        [cdkDropListDisabled]="!allowDrop"
        (cdkDropListDropped)="onCardDropped($event)"
        [id]="'column-' + column.id"
      >
        <div
          *ngFor="let card of cards; trackBy: trackByCardId"
          cdkDrag
          [cdkDragData]="card"
          [cdkDragDisabled]="!allowDrag"
          class="card-drag-container"
        >
          <app-kanban-card
            [card]="card"
            [editable]="editable"
            [isSelected]="selectedCardId === card.id"
            [isDragging]="false"
            (cardUpdated)="onCardUpdated(card.id, $event)"
            (cardDeleted)="onCardDeleted($event)"
            (cardSelected)="onCardSelected($event)"
          ></app-kanban-card>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="cards.length === 0 && !isAddingCard">
          <p>No cards yet</p>
          <button class="add-first-card-btn" (click)="startAddingCard()">
            Add a card
          </button>
        </div>

        <!-- Drop Placeholder -->
        <div class="drop-placeholder" *cdkDragPlaceholder>
          <div class="placeholder-card">Drop card here</div>
        </div>
      </div>

      <!-- Column Menu -->
      <div class="column-menu" *ngIf="showColumnMenu" (clickOutside)="closeColumnMenu()">
        <button (click)="startTitleEditing(); closeColumnMenu()">Edit Title</button>
        <button (click)="clearColumn(); closeColumnMenu()" [disabled]="cards.length === 0">
          Clear All Cards
        </button>
        <button (click)="toggleCollapse(); closeColumnMenu()">
          {{ column.isCollapsed ? 'Expand' : 'Collapse' }}
        </button>
      </div>
    </div>
  `,
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

  trackByCardId(index: number, card: KanbanCard): string {
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
